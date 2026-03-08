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
    const { action, cluster_id, item_id, target_cluster_id, item_ids } = await req.json();

    switch (action) {
      case 'merge': {
        if (!cluster_id || !target_cluster_id) return respond(400, { error: 'cluster_id and target_cluster_id required' });
        return await mergeClusters(supabase, cluster_id, target_cluster_id, lovableKey);
      }
      case 'split': {
        if (!cluster_id || !item_ids?.length) return respond(400, { error: 'cluster_id and item_ids required' });
        return await splitCluster(supabase, cluster_id, item_ids, lovableKey);
      }
      case 'remove_item': {
        if (!cluster_id || !item_id) return respond(400, { error: 'cluster_id and item_id required' });
        return await removeItemFromCluster(supabase, cluster_id, item_id);
      }
      case 'pin_item': {
        if (!cluster_id || !item_id) return respond(400, { error: 'cluster_id and item_id required' });
        return await pinItemToCluster(supabase, cluster_id, item_id);
      }
      case 'regenerate_summary': {
        if (!cluster_id) return respond(400, { error: 'cluster_id required' });
        return await regenerateSummary(supabase, cluster_id, lovableKey);
      }
      default:
        return respond(400, { error: `Unknown action: ${action}` });
    }
  } catch (err) {
    console.error('cluster-admin error:', err);
    return respond(500, { error: err.message });
  }
});

async function mergeClusters(supabase: any, sourceId: string, targetId: string, apiKey: string | undefined) {
  // Move all items from source to target
  const { data: items } = await supabase
    .from('event_cluster_items')
    .select('item_id')
    .eq('event_cluster_id', sourceId);

  for (const item of (items || [])) {
    // Check for duplicates
    const { data: existing } = await supabase
      .from('event_cluster_items')
      .select('id')
      .eq('event_cluster_id', targetId)
      .eq('item_id', item.item_id)
      .limit(1);

    if (!existing || existing.length === 0) {
      await supabase.from('event_cluster_items').insert({
        event_cluster_id: targetId,
        item_id: item.item_id,
        relevance_score: 0.8,
      });
    }
  }

  // Delete source cluster items and archive the cluster
  await supabase.from('event_cluster_items').delete().eq('event_cluster_id', sourceId);
  await supabase.from('event_clusters').update({ status: 'archived' }).eq('id', sourceId);

  // Recompute target cluster
  await recomputeClusterMetadata(supabase, targetId);

  // Regenerate summary if AI available
  if (apiKey) {
    try { await doRegenerateSummary(supabase, targetId, apiKey); } catch (e) { console.error(e); }
  }

  return respond(200, { message: 'Clusters merged', target_cluster_id: targetId });
}

async function splitCluster(supabase: any, clusterId: string, itemIds: string[], apiKey: string | undefined) {
  // Get original cluster
  const { data: original } = await supabase.from('event_clusters').select('*').eq('id', clusterId).single();
  if (!original) return respond(404, { error: 'Cluster not found' });

  // Create new cluster
  const slug = `split-${original.slug}-${Date.now().toString(36)}`;
  const { data: newCluster, error: createErr } = await supabase
    .from('event_clusters')
    .insert({
      title: original.title + ' (Split)',
      slug,
      description: 'Split from: ' + original.title,
      status: 'emerging',
      region_tags: original.region_tags,
      start_date: original.start_date,
    })
    .select()
    .single();

  if (createErr) return respond(500, { error: createErr.message });

  // Move selected items to new cluster
  for (const iid of itemIds) {
    await supabase.from('event_cluster_items').delete()
      .eq('event_cluster_id', clusterId).eq('item_id', iid);
    await supabase.from('event_cluster_items').insert({
      event_cluster_id: newCluster.id,
      item_id: iid,
      relevance_score: 0.9,
    });
  }

  // Recompute both
  await recomputeClusterMetadata(supabase, clusterId);
  await recomputeClusterMetadata(supabase, newCluster.id);

  if (apiKey) {
    try {
      await doRegenerateSummary(supabase, clusterId, apiKey);
      await doRegenerateSummary(supabase, newCluster.id, apiKey);
    } catch (e) { console.error(e); }
  }

  return respond(200, { message: 'Cluster split', original_id: clusterId, new_cluster_id: newCluster.id });
}

async function removeItemFromCluster(supabase: any, clusterId: string, itemId: string) {
  await supabase.from('event_cluster_items').delete()
    .eq('event_cluster_id', clusterId).eq('item_id', itemId);
  await recomputeClusterMetadata(supabase, clusterId);
  return respond(200, { message: 'Item removed', cluster_id: clusterId, item_id: itemId });
}

async function pinItemToCluster(supabase: any, clusterId: string, itemId: string) {
  // Check if already assigned
  const { data: existing } = await supabase
    .from('event_cluster_items')
    .select('id')
    .eq('event_cluster_id', clusterId)
    .eq('item_id', itemId)
    .limit(1);

  if (existing && existing.length > 0) {
    // Update relevance to 1.0 (pinned)
    await supabase.from('event_cluster_items')
      .update({ relevance_score: 1.0 })
      .eq('event_cluster_id', clusterId).eq('item_id', itemId);
  } else {
    await supabase.from('event_cluster_items').insert({
      event_cluster_id: clusterId,
      item_id: itemId,
      relevance_score: 1.0,
    });
  }

  await recomputeClusterMetadata(supabase, clusterId);
  return respond(200, { message: 'Item pinned', cluster_id: clusterId, item_id: itemId });
}

async function regenerateSummary(supabase: any, clusterId: string, apiKey: string | undefined) {
  if (!apiKey) return respond(400, { error: 'AI not available. LOVABLE_API_KEY not configured.' });
  await doRegenerateSummary(supabase, clusterId, apiKey);
  return respond(200, { message: 'Summary regenerated', cluster_id: clusterId });
}

async function doRegenerateSummary(supabase: any, clusterId: string, apiKey: string) {
  // Fetch cluster and its items
  const { data: cluster } = await supabase.from('event_clusters').select('*').eq('id', clusterId).single();
  if (!cluster) return;

  const { data: clusterItems } = await supabase
    .from('event_cluster_items')
    .select('item_id, relevance_score, items(title, summary_short, source_type, published_at, actor_tags, country_tags)')
    .eq('event_cluster_id', clusterId)
    .order('relevance_score', { ascending: false })
    .limit(20);

  const itemSummaries = (clusterItems || []).map((ci: any) => {
    const i = ci.items;
    return `[${i.source_type}] ${i.title} (${i.published_at?.substring(0, 10) || '?'}) - ${i.summary_short || 'No summary'}`;
  }).join('\n');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: 'You are a senior geopolitical intelligence analyst writing event cluster assessments. Be analytical, precise, and intelligence-focused.' },
        {
          role: 'user',
          content: `Analyze this event cluster and generate a comprehensive assessment.\n\nCluster Title: ${cluster.title}\nCurrent Description: ${cluster.description || 'None'}\nActors: ${(cluster.actor_tags || []).join(', ')}\nCountries: ${(cluster.country_tags || []).join(', ')}\nTopics: ${(cluster.topic_tags || []).join(', ')}\nRegions: ${(cluster.region_tags || []).join(', ')}\n\nRelated Items (${(clusterItems || []).length} shown):\n${itemSummaries}`
        },
      ],
      tools: [{
        type: 'function',
        function: {
          name: 'generate_cluster_assessment',
          description: 'Generate a comprehensive event cluster assessment',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Concise analytical title (max 80 chars)' },
              description: { type: 'string', description: 'Intelligence summary paragraph (max 400 chars)' },
              grouping_rationale: { type: 'string', description: 'Explain why these items form a coherent cluster: shared actors, overlapping geographies, connected timelines, thematic links (max 600 chars)' },
              narrative_comparison: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    source_type: { type: 'string' },
                    framing: { type: 'string', description: 'How this source type frames the story (max 150 chars)' },
                  },
                  required: ['source_type', 'framing'],
                  additionalProperties: false,
                },
                description: 'Compare how different source types frame this event',
              },
              significance_score: { type: 'number', description: 'Geopolitical significance 0.0-1.0' },
              confidence_score: { type: 'number', description: 'Analytical confidence in clustering 0.0-1.0' },
            },
            required: ['title', 'description', 'grouping_rationale', 'narrative_comparison', 'significance_score', 'confidence_score'],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: 'function', function: { name: 'generate_cluster_assessment' } },
    }),
  });

  if (!response.ok) {
    console.error('AI summary regeneration failed:', response.status);
    return;
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return;

  const result = JSON.parse(toolCall.function.arguments);

  await supabase.from('event_clusters').update({
    title: result.title || cluster.title,
    description: result.description || cluster.description,
    grouping_rationale: result.grouping_rationale,
    narrative_comparison: result.narrative_comparison || [],
    significance_score: result.significance_score,
    confidence_score: result.confidence_score,
  }).eq('id', clusterId);
}

async function recomputeClusterMetadata(supabase: any, clusterId: string) {
  const { data: items } = await supabase
    .from('event_cluster_items')
    .select('items(actor_tags, country_tags, topic_tags, region_tags, source_id, source_type)')
    .eq('event_cluster_id', clusterId);

  if (!items || items.length === 0) return;

  const allActors: Record<string, number> = {};
  const allCountries: Record<string, number> = {};
  const allTopics: Record<string, number> = {};
  const allRegions = new Set<string>();
  const sources = new Set<string>();

  for (const ci of items) {
    const item = ci.items as any;
    if (!item) continue;
    for (const a of item.actor_tags || []) allActors[a] = (allActors[a] || 0) + 1;
    for (const c of item.country_tags || []) allCountries[c] = (allCountries[c] || 0) + 1;
    for (const t of item.topic_tags || []) allTopics[t] = (allTopics[t] || 0) + 1;
    for (const r of item.region_tags || []) allRegions.add(r);
    if (item.source_id) sources.add(item.source_id);
    else if (item.source_type) sources.add(item.source_type);
  }

  const sortByCount = (obj: Record<string, number>) => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(e => e[0]);

  await supabase.from('event_clusters').update({
    item_count: items.length,
    source_diversity_count: sources.size,
    actor_tags: sortByCount(allActors),
    country_tags: sortByCount(allCountries),
    topic_tags: sortByCount(allTopics),
    region_tags: [...allRegions],
    top_actors: sortByCount(allActors).slice(0, 10),
    top_countries: sortByCount(allCountries).slice(0, 10),
    top_topics: sortByCount(allTopics).slice(0, 10),
  }).eq('id', clusterId);
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
