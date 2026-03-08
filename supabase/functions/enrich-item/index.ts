import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const { item_id, batch_mode } = await req.json();

    if (batch_mode) {
      // Process unclustered items in batch
      const { data: unclustered } = await supabase
        .from('items')
        .select('id, title, summary_short, content_clean, region_tags, country_tags, topic_tags, actor_tags, published_at, source_type, source_id')
        .eq('ingestion_status', 'pending')
        .order('published_at', { ascending: false })
        .limit(50);

      if (!unclustered || unclustered.length === 0) {
        return respond(200, { message: 'No unclustered items to process', processed: 0 });
      }

      let processed = 0;
      for (const item of unclustered) {
        await processItem(supabase, item, lovableKey);
        processed++;
      }

      return respond(200, { message: `Processed ${processed} items`, processed });
    }

    if (!item_id) return respond(400, { error: 'item_id or batch_mode required' });

    const { data: item, error: itemErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', item_id)
      .single();

    if (itemErr || !item) return respond(404, { error: 'Item not found' });

    const result = await processItem(supabase, item, lovableKey);
    return respond(200, result);

  } catch (err) {
    console.error('enrich-item error:', err);
    return respond(500, { error: err.message });
  }
});

async function processItem(supabase: any, item: any, lovableKey: string | undefined) {
  // Step 1: AI enrichment if we have the API key and item lacks tags
  if (lovableKey && (!item.topic_tags?.length || !item.actor_tags?.length || !item.summary_short)) {
    try {
      const enriched = await aiEnrich(item, lovableKey);
      if (enriched) {
        const updates: any = {};
        if (enriched.topic_tags?.length) updates.topic_tags = enriched.topic_tags;
        if (enriched.actor_tags?.length) updates.actor_tags = enriched.actor_tags;
        if (enriched.country_tags?.length) updates.country_tags = enriched.country_tags;
        if (enriched.region_tags?.length) updates.region_tags = enriched.region_tags;
        if (enriched.summary_short) updates.summary_short = enriched.summary_short;
        if (enriched.importance_score != null) updates.importance_score = enriched.importance_score;
        if (enriched.sentiment_label) updates.sentiment_label = enriched.sentiment_label;

        if (Object.keys(updates).length > 0) {
          await supabase.from('items').update(updates).eq('id', item.id);
          Object.assign(item, updates);
        }
      }
    } catch (e) {
      console.error('AI enrichment failed, continuing with rule-based:', e.message);
    }
  }

  // Step 2: Find best matching cluster using multi-signal scoring
  const cluster = await findOrCreateCluster(supabase, item, lovableKey);

  // Step 3: Mark item as processed
  await supabase.from('items').update({ ingestion_status: 'completed' }).eq('id', item.id);

  return {
    item_id: item.id,
    cluster_id: cluster?.id,
    cluster_title: cluster?.title,
    status: 'processed',
  };
}

// ─── AI Enrichment ──────────────────────────────────────────────────────────
async function aiEnrich(item: any, apiKey: string) {
  const text = item.content_clean || item.summary_short || item.title;
  if (!text) return null;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a geopolitical intelligence analyst. Extract structured metadata from news items. Be precise and use established terminology.'
        },
        {
          role: 'user',
          content: `Analyze this news item and extract metadata.\n\nTitle: ${item.title}\nContent: ${text.substring(0, 3000)}`
        }
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'extract_metadata',
          description: 'Extract geopolitical metadata from a news item',
          parameters: {
            type: 'object',
            properties: {
              topic_tags: { type: 'array', items: { type: 'string' }, description: 'Topics: military, diplomacy, trade, energy, sanctions, maritime, conflict, humanitarian, climate, political, tech, cyber, election, terrorism' },
              actor_tags: { type: 'array', items: { type: 'string' }, description: 'Named actors: countries, organizations, leaders, militias, companies' },
              country_tags: { type: 'array', items: { type: 'string' }, description: 'Countries directly involved' },
              region_tags: { type: 'array', items: { type: 'string' }, description: 'Regions: North America, Latin America, Europe, Russia / Eurasia, Middle East, North Africa, Sub-Saharan Africa, Horn of Africa, South Asia, East Asia, Southeast Asia, Oceania, Arctic / Maritime, Global' },
              summary_short: { type: 'string', description: 'One-sentence intelligence summary (max 200 chars)' },
              importance_score: { type: 'number', description: 'Geopolitical importance 0.0-1.0' },
              sentiment_label: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
            },
            required: ['topic_tags', 'actor_tags', 'country_tags', 'region_tags', 'summary_short', 'importance_score', 'sentiment_label'],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'extract_metadata' } },
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`AI enrichment failed: ${response.status} ${t.substring(0, 200)}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return null;

  return JSON.parse(toolCall.function.arguments);
}

// ─── Multi-Signal Clustering ────────────────────────────────────────────────
async function findOrCreateCluster(supabase: any, item: any, lovableKey: string | undefined) {
  // Fetch active/emerging clusters from the last 14 days
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data: clusters } = await supabase
    .from('event_clusters')
    .select('id, title, description, actor_tags, country_tags, topic_tags, region_tags, start_date, status, item_count')
    .in('status', ['emerging', 'active', 'ongoing'])
    .gte('updated_at', twoWeeksAgo)
    .order('updated_at', { ascending: false })
    .limit(100);

  if (!clusters || clusters.length === 0) {
    return await createNewCluster(supabase, item, lovableKey);
  }

  // Score each cluster for match quality
  let bestCluster: any = null;
  let bestScore = 0;

  for (const cluster of clusters) {
    const score = computeMatchScore(item, cluster);
    if (score > bestScore) {
      bestScore = score;
      bestCluster = cluster;
    }
  }

  // Threshold: need at least 0.35 combined score to assign
  if (bestScore >= 0.35 && bestCluster) {
    await assignToCluster(supabase, item, bestCluster, bestScore);
    return bestCluster;
  }

  // No good match — create new cluster
  return await createNewCluster(supabase, item, lovableKey);
}

function computeMatchScore(item: any, cluster: any): number {
  let score = 0;
  const weights = {
    actor: 0.30,
    country: 0.20,
    topic: 0.20,
    region: 0.10,
    time: 0.20,
  };

  // Actor overlap
  const itemActors = new Set((item.actor_tags || []).map((a: string) => a.toLowerCase()));
  const clusterActors = new Set((cluster.actor_tags || []).map((a: string) => a.toLowerCase()));
  if (itemActors.size > 0 && clusterActors.size > 0) {
    const overlap = [...itemActors].filter(a => clusterActors.has(a)).length;
    const union = new Set([...itemActors, ...clusterActors]).size;
    score += weights.actor * (overlap / union);
  }

  // Country overlap
  const itemCountries = new Set((item.country_tags || []).map((c: string) => c.toLowerCase()));
  const clusterCountries = new Set((cluster.country_tags || []).map((c: string) => c.toLowerCase()));
  if (itemCountries.size > 0 && clusterCountries.size > 0) {
    const overlap = [...itemCountries].filter(c => clusterCountries.has(c)).length;
    const union = new Set([...itemCountries, ...clusterCountries]).size;
    score += weights.country * (overlap / union);
  }

  // Topic overlap
  const itemTopics = new Set((item.topic_tags || []).map((t: string) => t.toLowerCase()));
  const clusterTopics = new Set((cluster.topic_tags || []).map((t: string) => t.toLowerCase()));
  if (itemTopics.size > 0 && clusterTopics.size > 0) {
    const overlap = [...itemTopics].filter(t => clusterTopics.has(t)).length;
    const union = new Set([...itemTopics, ...clusterTopics]).size;
    score += weights.topic * (overlap / union);
  }

  // Region overlap
  const itemRegions = new Set((item.region_tags || []).map((r: string) => r.toLowerCase()));
  const clusterRegions = new Set((cluster.region_tags || []).map((r: string) => r.toLowerCase()));
  if (itemRegions.size > 0 && clusterRegions.size > 0) {
    const overlap = [...itemRegions].filter(r => clusterRegions.has(r)).length;
    score += weights.region * (overlap > 0 ? 1 : 0);
  }

  // Time proximity (decay over 7 days)
  if (item.published_at && cluster.start_date) {
    const itemDate = new Date(item.published_at).getTime();
    const clusterDate = new Date(cluster.start_date).getTime();
    const daysDiff = Math.abs(itemDate - clusterDate) / 86400000;
    const timeScore = Math.max(0, 1 - daysDiff / 7);
    score += weights.time * timeScore;
  }

  return score;
}

async function assignToCluster(supabase: any, item: any, cluster: any, relevanceScore: number) {
  // Check if already assigned
  const { data: existing } = await supabase
    .from('event_cluster_items')
    .select('id')
    .eq('event_cluster_id', cluster.id)
    .eq('item_id', item.id)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabase.from('event_cluster_items').insert({
    event_cluster_id: cluster.id,
    item_id: item.id,
    relevance_score: Math.round(relevanceScore * 100) / 100,
  });

  // Update cluster metadata
  const newItemCount = (cluster.item_count || 0) + 1;
  const mergedActors = mergeArrays(cluster.actor_tags, item.actor_tags);
  const mergedCountries = mergeArrays(cluster.country_tags, item.country_tags);
  const mergedTopics = mergeArrays(cluster.topic_tags, item.topic_tags);
  const mergedRegions = mergeArrays(cluster.region_tags, item.region_tags);

  // Count unique sources
  const { count: sourceDiversity } = await supabase
    .from('event_cluster_items')
    .select('item_id', { count: 'exact' })
    .eq('event_cluster_id', cluster.id);

  // Determine status based on item count
  let status = cluster.status;
  if (newItemCount >= 10 && status === 'emerging') status = 'active';

  await supabase.from('event_clusters').update({
    item_count: newItemCount,
    actor_tags: mergedActors,
    country_tags: mergedCountries,
    topic_tags: mergedTopics,
    region_tags: mergedRegions,
    source_diversity_count: sourceDiversity || 0,
    top_actors: mergedActors.slice(0, 10),
    top_countries: mergedCountries.slice(0, 10),
    top_topics: mergedTopics.slice(0, 10),
    status,
  }).eq('id', cluster.id);
}

async function createNewCluster(supabase: any, item: any, lovableKey: string | undefined) {
  const title = item.title.length > 80 ? item.title.substring(0, 77) + '…' : item.title;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);

  let description = item.summary_short || item.title;
  let rationale = `Initial cluster created from item: "${item.title}". Tags: ${(item.topic_tags || []).join(', ')}. Actors: ${(item.actor_tags || []).join(', ')}.`;

  // Use AI for better cluster description if available
  if (lovableKey) {
    try {
      const aiResult = await generateClusterSummary(lovableKey, item.title, description, item.actor_tags, item.country_tags, item.topic_tags);
      if (aiResult) {
        description = aiResult.description || description;
        rationale = aiResult.rationale || rationale;
      }
    } catch (e) {
      console.error('AI cluster summary failed:', e.message);
    }
  }

  const { data: cluster, error } = await supabase
    .from('event_clusters')
    .insert({
      title,
      slug: slug + '-' + Date.now().toString(36),
      description,
      grouping_rationale: rationale,
      start_date: item.published_at ? new Date(item.published_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: 'emerging',
      region_tags: item.region_tags || [],
      country_tags: item.country_tags || [],
      topic_tags: item.topic_tags || [],
      actor_tags: item.actor_tags || [],
      top_actors: (item.actor_tags || []).slice(0, 10),
      top_countries: (item.country_tags || []).slice(0, 10),
      top_topics: (item.topic_tags || []).slice(0, 10),
      confidence_score: 0.5,
      significance_score: item.importance_score || 0.5,
      item_count: 1,
      source_diversity_count: 1,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create cluster:', error);
    return null;
  }

  // Link item to cluster
  await supabase.from('event_cluster_items').insert({
    event_cluster_id: cluster.id,
    item_id: item.id,
    relevance_score: 1.0,
  });

  return cluster;
}

async function generateClusterSummary(apiKey: string, title: string, summary: string, actors: string[], countries: string[], topics: string[]) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'You are a geopolitical intelligence analyst creating event cluster summaries.' },
        { role: 'user', content: `Create an event cluster summary.\n\nTitle: ${title}\nSummary: ${summary}\nActors: ${(actors || []).join(', ')}\nCountries: ${(countries || []).join(', ')}\nTopics: ${(topics || []).join(', ')}` },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'create_cluster_summary',
          description: 'Generate a cluster description and grouping rationale',
          parameters: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'One paragraph intelligence summary of this event cluster (max 300 chars)' },
              rationale: { type: 'string', description: 'Explain why items are grouped: which actors, topics, and regions connect them (max 500 chars)' },
            },
            required: ['description', 'rationale'],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'create_cluster_summary' } },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return null;
  return JSON.parse(toolCall.function.arguments);
}

function mergeArrays(existing: string[] | null, incoming: string[] | null): string[] {
  const set = new Set([...(existing || []), ...(incoming || [])]);
  return [...set];
}

function respond(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
      'Content-Type': 'application/json',
    },
  });
}
