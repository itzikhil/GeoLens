# Handoff to Claude Code

## Quick Start

```bash
git clone https://github.com/itzikhil/GeoLens.git
cd GeoLens
npm install
cp .env.example .env   # fill in Supabase credentials
npm run dev             # starts at http://localhost:5173
```

## Where Core Logic Lives

| Module | Path | What it does |
|--------|------|-------------|
| Ingestion | `supabase/functions/ingest-source/index.ts` | RSS parsing, dedup, retry, job tracking |
| Enrichment | `supabase/functions/enrich-item/index.ts` | AI tagging via Lovable AI Gateway, clustering assignment |
| Cluster Admin | `supabase/functions/cluster-admin/index.ts` | Merge/split/pin/regenerate cluster operations |
| Daily Brief | `supabase/functions/generate-daily-brief/index.ts` | **Placeholder** — not implemented |
| Auth Context | `src/contexts/AuthContext.tsx` | Session management, role detection |
| Route Guards | `src/components/auth/ProtectedRoute.tsx`, `AdminRoute.tsx` | Auth + RBAC enforcement |
| Demo Data | `src/lib/demo-data.ts` | Hardcoded demo data used when DB is empty |
| Region Config | `src/lib/region-data.ts` | 13 regions, subregions, country mappings |
| Source Templates | `src/lib/source-templates.ts` | Quick-create templates for source types |

## Database Migrations

All migrations are in `supabase/migrations/`. They contain the full schema including tables, enums, RLS policies, functions, and triggers.

## Edge Function Deployment

Edge functions auto-deploy when using Lovable. For standalone deployment:
```bash
supabase functions deploy ingest-source
supabase functions deploy enrich-item
supabase functions deploy cluster-admin
supabase functions deploy generate-daily-brief
```

Required secrets (set via `supabase secrets set`):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — auto-provided
- `LOVABLE_API_KEY` — enables AI enrichment and cluster summaries
- `NEWS_API_KEY`, `YOUTUBE_API_KEY`, `X_BEARER_TOKEN`, `TELEGRAM_BOT_TOKEN` — optional, for future handlers

## Known Fragile Areas

1. **Demo data fallback**: Many pages fall back to `demo-data.ts` when DB is empty. This masks real data issues.
2. **Clustering threshold**: The 0.35 match threshold in `enrich-item` is not tuned — can create too many small clusters or merge unrelated items.
3. **RSS parsing**: Uses regex-based XML parsing (no proper DOM parser in Deno edge functions). May fail on malformed feeds.
4. **RLS policy model**: All SELECT policies use `true` (public read). This is intentional for a public intelligence dashboard but review if access control changes.
5. **No scheduled ingestion**: No cron/scheduler exists. Ingestion must be triggered manually or via external scheduler.

## Recommended Next Engineering Steps

1. **Implement scheduled ingestion** — Use Supabase pg_cron or external scheduler to call `ingest-source` periodically
2. **Replace demo data with real queries** — Pages should query Supabase directly instead of falling back to hardcoded data
3. **Add semantic search** — Use pgvector + embeddings for better clustering and search
4. **Implement `generate-daily-brief`** — Wire up the placeholder to produce AI-generated daily summaries
5. **Add error monitoring** — Structured logging and alerting for failed ingestion jobs
6. **Build the Watchlists UI** — Currently a stub page; needs CRUD operations
7. **Implement real-time feed** — Use Supabase Realtime for live item updates on the feed page
8. **Add export capabilities** — CSV/PDF export for clusters and briefings
9. **Tune clustering weights** — Evaluate clustering quality and adjust signal weights
10. **Add source health monitoring** — Dashboard showing feed freshness, error rates, item counts per source
