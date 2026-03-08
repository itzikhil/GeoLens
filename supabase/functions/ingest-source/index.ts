import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source_id, source_type } = await req.json();

    // Placeholder: Route to appropriate ingestion handler
    const handlers: Record<string, string> = {
      rss: 'ingest_rss',
      mainstream: 'ingest_rss',
      api: 'ingest_news_api',
      youtube: 'ingest_youtube',
      podcast: 'ingest_podcast',
      x: 'ingest_x',
      telegram: 'ingest_telegram',
    };

    const handler = handlers[source_type] || 'ingest_rss';

    return new Response(
      JSON.stringify({
        message: `Ingestion job queued for source ${source_id}`,
        handler,
        status: 'queued',
        note: 'This is a placeholder. Configure API keys in Admin > Settings to enable live ingestion.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
