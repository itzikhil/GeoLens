import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Handler registry ───────────────────────────────────────────────────────
// Each handler returns { items: ParsedItem[], errors: string[] }
// Status: ✅ = fully implemented, ⚠️ = partially implemented, 🔲 = placeholder

interface ParsedItem {
  external_item_id: string;
  title: string;
  url: string | null;
  author: string | null;
  published_at: string | null;
  content_raw: string | null;
  content_clean: string | null;
  summary_short: string | null;
  media_type: string;
  language: string;
  thumbnail_url: string | null;
}

interface HandlerResult {
  items: ParsedItem[];
  errors: string[];
  handler_status: 'fully_implemented' | 'partially_implemented' | 'placeholder';
}

// ✅ RSS Handler — Fully implemented
// Fetches and parses RSS/Atom feeds natively
async function handleRSS(source: any): Promise<HandlerResult> {
  const errors: string[] = [];
  const items: ParsedItem[] = [];

  if (!source.rss_url) {
    return { items: [], errors: ['No rss_url configured for this source'], handler_status: 'fully_implemented' };
  }

  try {
    const res = await fetch(source.rss_url, {
      headers: { 'User-Agent': 'GeoLens/1.0 (RSS Ingestion)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return { items: [], errors: [`RSS fetch failed: HTTP ${res.status} ${res.statusText}`], handler_status: 'fully_implemented' };
    }

    const xml = await res.text();
    
    // Parse RSS 2.0 and Atom feeds
    const rssItems = parseRSSItems(xml);

    for (const ri of rssItems) {
      items.push({
        external_item_id: ri.guid || ri.link || ri.title,
        title: ri.title || 'Untitled',
        url: ri.link || null,
        author: ri.author || null,
        published_at: ri.pubDate ? new Date(ri.pubDate).toISOString() : null,
        content_raw: ri.description || null,
        content_clean: stripHTML(ri.description || ''),
        summary_short: truncate(stripHTML(ri.description || ''), 200),
        media_type: 'article',
        language: source.language || 'en',
        thumbnail_url: ri.thumbnail || null,
      });
    }
  } catch (err) {
    errors.push(`RSS parse error: ${err.message}`);
  }

  return { items, errors, handler_status: 'fully_implemented' };
}

// 🔲 News API Handler — Placeholder
// Requires NEWS_API_KEY secret
async function handleNewsAPI(source: any): Promise<HandlerResult> {
  const apiKey = Deno.env.get('NEWS_API_KEY');
  if (!apiKey) {
    return {
      items: [],
      errors: ['NEWS_API_KEY secret not configured. Add it via Admin > Settings to enable News API ingestion.'],
      handler_status: 'placeholder',
    };
  }

  // When key is configured, implement:
  // GET https://newsapi.org/v2/everything?sources={source.external_id}&apiKey={apiKey}
  return {
    items: [],
    errors: ['News API handler ready but not yet connected. External ID: ' + (source.external_id || 'not set')],
    handler_status: 'placeholder',
  };
}

// 🔲 YouTube Handler — Placeholder
// Requires YOUTUBE_API_KEY secret
async function handleYouTube(source: any): Promise<HandlerResult> {
  const apiKey = Deno.env.get('YOUTUBE_API_KEY');
  if (!apiKey) {
    return {
      items: [],
      errors: ['YOUTUBE_API_KEY secret not configured. Add it via Admin > Settings to enable YouTube ingestion.'],
      handler_status: 'placeholder',
    };
  }

  return {
    items: [],
    errors: ['YouTube handler ready but not yet connected. Channel ID: ' + (source.external_id || 'not set')],
    handler_status: 'placeholder',
  };
}

// ⚠️ Podcast RSS Handler — Partially implemented
// Uses same RSS logic but extracts podcast-specific fields
async function handlePodcast(source: any): Promise<HandlerResult> {
  if (!source.rss_url) {
    return { items: [], errors: ['No rss_url configured for podcast source'], handler_status: 'partially_implemented' };
  }

  const rssResult = await handleRSS(source);
  // Override media_type for podcast items
  const podcastItems = rssResult.items.map(item => ({
    ...item,
    media_type: 'podcast_episode' as const,
  }));

  return { items: podcastItems, errors: rssResult.errors, handler_status: 'partially_implemented' };
}

// 🔲 X/Twitter Handler — Placeholder
// Requires X_BEARER_TOKEN secret
async function handleX(source: any): Promise<HandlerResult> {
  const token = Deno.env.get('X_BEARER_TOKEN');
  if (!token) {
    return {
      items: [],
      errors: ['X_BEARER_TOKEN secret not configured. Add it via Admin > Settings to enable X/Twitter ingestion.'],
      handler_status: 'placeholder',
    };
  }

  return {
    items: [],
    errors: ['X handler ready but not yet connected. Account/list: ' + (source.external_id || 'not set')],
    handler_status: 'placeholder',
  };
}

// 🔲 Telegram Handler — Placeholder
// Requires TELEGRAM_BOT_TOKEN secret
async function handleTelegram(source: any): Promise<HandlerResult> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) {
    return {
      items: [],
      errors: ['TELEGRAM_BOT_TOKEN secret not configured. Add it via Admin > Settings to enable Telegram ingestion.'],
      handler_status: 'placeholder',
    };
  }

  return {
    items: [],
    errors: ['Telegram handler ready but not yet connected. Channel: ' + (source.external_id || 'not set')],
    handler_status: 'placeholder',
  };
}

// ⚠️ Manual URL Import — Partially implemented
// Fetches a single URL and extracts basic metadata
async function handleManualURL(source: any, manualUrl?: string): Promise<HandlerResult> {
  const url = manualUrl || source.base_url;
  if (!url) {
    return { items: [], errors: ['No URL provided for manual import'], handler_status: 'partially_implemented' };
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GeoLens/1.0 (Manual Import)' },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return { items: [], errors: [`Manual fetch failed: HTTP ${res.status}`], handler_status: 'partially_implemented' };
    }

    const html = await res.text();
    const title = extractMetaTag(html, 'og:title') || extractHTMLTitle(html) || 'Untitled';
    const description = extractMetaTag(html, 'og:description') || '';
    const thumbnail = extractMetaTag(html, 'og:image') || null;

    return {
      items: [{
        external_item_id: url,
        title,
        url,
        author: extractMetaTag(html, 'author') || null,
        published_at: null,
        content_raw: html.substring(0, 50000),
        content_clean: description,
        summary_short: truncate(description, 200),
        media_type: 'article',
        language: source.language || 'en',
        thumbnail_url: thumbnail,
      }],
      errors: [],
      handler_status: 'partially_implemented',
    };
  } catch (err) {
    return { items: [], errors: [`Manual URL fetch error: ${err.message}`], handler_status: 'partially_implemented' };
  }
}

// ─── Handler router ─────────────────────────────────────────────────────────
const HANDLER_MAP: Record<string, (source: any, extra?: any) => Promise<HandlerResult>> = {
  rss: handleRSS,
  mainstream: handleRSS,
  niche: handleRSS,
  think_tank: handleRSS,
  government: handleRSS,
  api: handleNewsAPI,
  youtube: handleYouTube,
  podcast: handlePodcast,
  x: handleX,
  telegram: handleTelegram,
  custom: handleManualURL,
};

// ─── XML Parsing Helpers ────────────────────────────────────────────────────
function parseRSSItems(xml: string): Array<{
  title: string; link: string; guid: string;
  description: string; pubDate: string; author: string; thumbnail: string;
}> {
  const items: any[] = [];
  
  // Try RSS 2.0 <item> tags
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, 'title'),
      link: extractTag(block, 'link'),
      guid: extractTag(block, 'guid') || extractTag(block, 'link'),
      description: extractTag(block, 'description') || extractTag(block, 'content:encoded'),
      pubDate: extractTag(block, 'pubDate') || extractTag(block, 'dc:date'),
      author: extractTag(block, 'author') || extractTag(block, 'dc:creator'),
      thumbnail: extractAttr(block, 'media:thumbnail', 'url') || extractAttr(block, 'media:content', 'url') || extractAttr(block, 'enclosure', 'url'),
    });
  }

  // Try Atom <entry> tags if no RSS items found
  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["']/);
      items.push({
        title: extractTag(block, 'title'),
        link: linkMatch ? linkMatch[1] : '',
        guid: extractTag(block, 'id') || (linkMatch ? linkMatch[1] : ''),
        description: extractTag(block, 'summary') || extractTag(block, 'content'),
        pubDate: extractTag(block, 'published') || extractTag(block, 'updated'),
        author: extractTag(block, 'name'),
        thumbnail: '',
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = xml.match(regex);
  return m ? (m[1] || m[2] || '').trim() : '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const m = xml.match(regex);
  return m ? m[1] : '';
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

function extractMetaTag(html: string, property: string): string | null {
  const regex = new RegExp(`<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`, 'i');
  const m = html.match(regex);
  return m ? m[1] : null;
}

function extractHTMLTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

// ─── Main Server ────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const body = await req.json();
    const { source_id, manual_url, test_mode } = body;

    if (!source_id) {
      return respond(400, { error: 'source_id is required' });
    }

    // ── Fetch source ──────────────────────────────────────────────────
    const { data: source, error: srcErr } = await supabase
      .from('sources')
      .select('*')
      .eq('id', source_id)
      .single();

    if (srcErr || !source) {
      return respond(404, { error: `Source not found: ${srcErr?.message || source_id}` });
    }

    // ── Skip disabled sources (unless test mode) ────────────────────
    if (!source.is_active && !test_mode) {
      return respond(200, { skipped: true, reason: 'Source is disabled', source_id });
    }

    // ── Rate limit check ────────────────────────────────────────────
    if (!test_mode && source.last_ingested_at) {
      const lastIngest = new Date(source.last_ingested_at).getTime();
      const cooldown = (source.rate_limit_seconds || 60) * 1000;
      if (Date.now() - lastIngest < cooldown) {
        return respond(200, { skipped: true, reason: `Rate limited. Next ingest in ${Math.ceil((cooldown - (Date.now() - lastIngest)) / 1000)}s`, source_id });
      }
    }

    // ── Create job record ───────────────────────────────────────────
    const { data: job, error: jobErr } = await supabase
      .from('ingestion_jobs')
      .insert({
        source_id: source.id,
        job_type: `${source.source_type}_ingest`,
        status: 'running',
        started_at: new Date().toISOString(),
        items_fetched: 0,
        items_inserted: 0,
        items_skipped_duplicate: 0,
        retry_count: 0,
        max_retries: 3,
      })
      .select()
      .single();

    if (jobErr) {
      return respond(500, { error: `Failed to create job record: ${jobErr.message}` });
    }

    // ── Run handler with retry logic ────────────────────────────────
    const handler = HANDLER_MAP[source.source_type] || handleRSS;
    let result: HandlerResult | null = null;
    let lastError = '';
    const maxRetries = 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        result = await handler(source, manual_url);
        break;
      } catch (err) {
        lastError = err.message;
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        }
      }
    }

    if (!result) {
      // All retries exhausted
      await supabase.from('ingestion_jobs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: `All ${maxRetries} retries exhausted. Last error: ${lastError}`,
        retry_count: maxRetries,
      }).eq('id', job.id);

      return respond(500, { error: `Ingestion failed after ${maxRetries} retries`, last_error: lastError });
    }

    // ── Deduplication and insert ────────────────────────────────────
    let insertedCount = 0;
    let duplicateCount = 0;
    const insertErrors: string[] = [...result.errors];

    if (result.items.length > 0) {
      // Fetch existing external_item_ids for this source to deduplicate
      const externalIds = result.items.map(i => i.external_item_id).filter(Boolean);
      const { data: existing } = await supabase
        .from('items')
        .select('external_item_id')
        .eq('source_id', source.id)
        .in('external_item_id', externalIds);

      const existingSet = new Set((existing || []).map(e => e.external_item_id));

      const newItems = result.items.filter(i => !existingSet.has(i.external_item_id));
      duplicateCount = result.items.length - newItems.length;

      if (newItems.length > 0) {
        // Batch insert in chunks of 50
        for (let i = 0; i < newItems.length; i += 50) {
          const batch = newItems.slice(i, i + 50).map(item => ({
            source_id: source.id,
            source_type: source.source_type,
            external_item_id: item.external_item_id,
            title: item.title,
            url: item.url,
            author: item.author,
            published_at: item.published_at,
            content_raw: item.content_raw,
            content_clean: item.content_clean,
            summary_short: item.summary_short,
            media_type: item.media_type,
            language: item.language,
            thumbnail_url: item.thumbnail_url,
            ingestion_status: 'pending',
          }));

          const { error: insertErr, data: inserted } = await supabase
            .from('items')
            .insert(batch)
            .select('id');

          if (insertErr) {
            insertErrors.push(`Batch insert error: ${insertErr.message}`);
          } else {
            insertedCount += (inserted || []).length;
          }
        }
      }
    }

    // ── Determine final status ──────────────────────────────────────
    let finalStatus: string = 'completed';
    if (insertErrors.length > 0 && insertedCount === 0 && result.items.length > 0) {
      finalStatus = 'failed';
    } else if (insertErrors.length > 0 && insertedCount > 0) {
      finalStatus = 'partial_success';
    }

    // ── Update job record ───────────────────────────────────────────
    await supabase.from('ingestion_jobs').update({
      status: finalStatus,
      finished_at: new Date().toISOString(),
      items_fetched: result.items.length,
      items_inserted: insertedCount,
      items_skipped_duplicate: duplicateCount,
      error_message: insertErrors.length > 0 ? insertErrors.join(' | ') : null,
      stats_json: {
        handler_status: result.handler_status,
        source_type: source.source_type,
        test_mode: !!test_mode,
      },
    }).eq('id', job.id);

    // ── Update source last_ingested_at ──────────────────────────────
    const sourceUpdate: any = { last_ingested_at: new Date().toISOString() };
    if (finalStatus === 'completed' || finalStatus === 'partial_success') {
      sourceUpdate.last_successful_ingest_at = new Date().toISOString();
    }
    await supabase.from('sources').update(sourceUpdate).eq('id', source.id);

    return respond(200, {
      job_id: job.id,
      source_id: source.id,
      source_name: source.name,
      status: finalStatus,
      handler_status: result.handler_status,
      items_fetched: result.items.length,
      items_inserted: insertedCount,
      items_skipped_duplicate: duplicateCount,
      errors: insertErrors.length > 0 ? insertErrors : undefined,
      test_mode: !!test_mode,
    });

  } catch (error) {
    return respond(500, { error: error.message });
  }
});

function respond(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
