# GeoLens

Open-source geopolitical intelligence platform. Ingests multi-source news via RSS, enriches with AI-extracted metadata, clusters related events, and presents them through an analytical dashboard.

## Architecture

```
Sources (RSS) → ingest-source → items → enrich-item → event_clusters → React Dashboard
                                                          ↕
                                                    cluster-admin (merge/split/regenerate)
```

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth + RLS)
- **AI**: Lovable AI Gateway (Gemini 3 Flash Preview) for enrichment and cluster summaries

## Quick Start

```bash
git clone https://github.com/itzikhil/GeoLens.git
cd GeoLens
npm install
cp .env.example .env   # fill in your Supabase credentials
npm run dev             # http://localhost:5173
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Yes | Supabase project ID |

Edge function secrets (set via `supabase secrets set`):
- `LOVABLE_API_KEY` — Enables AI enrichment
- `NEWS_API_KEY`, `YOUTUBE_API_KEY`, `X_BEARER_TOKEN`, `TELEGRAM_BOT_TOKEN` — Optional platform integrations

## How Ingestion Works

1. `ingest-source` fetches RSS/Atom feeds from configured sources
2. Parses items, deduplicates by `external_item_id`
3. Inserts new items with status `pending`
4. Tracks job metadata (fetched, inserted, skipped, errors)

See [docs/INGESTION_PIPELINE.md](docs/INGESTION_PIPELINE.md)

## How Enrichment Works

1. `enrich-item` processes pending items via Lovable AI Gateway
2. Extracts: topics, actors, countries, regions, sentiment, importance
3. Assigns item to best-matching event cluster (multi-signal scoring)
4. Creates new cluster if no match above 0.35 threshold

See [docs/ENRICHMENT_PIPELINE.md](docs/ENRICHMENT_PIPELINE.md)

## How Clustering Works

Multi-signal Jaccard similarity: actor overlap (30%), country (20%), topic (20%), time proximity (20%), region (10%). Threshold: 0.35.

See [docs/CLUSTERING.md](docs/CLUSTERING.md)

## Current Limitations

- Most frontend pages use hardcoded demo data (not live DB queries)
- No scheduled ingestion (must trigger manually)
- RSS parsing is regex-based
- Clustering threshold is untuned
- No semantic search / embeddings
- Watchlists page is a stub
- Daily brief function is a placeholder

See [docs/KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md)

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture and data flow |
| [INGESTION_PIPELINE.md](docs/INGESTION_PIPELINE.md) | Source registry, handlers, dedup, retry |
| [ENRICHMENT_PIPELINE.md](docs/ENRICHMENT_PIPELINE.md) | AI enrichment and entity extraction |
| [CLUSTERING.md](docs/CLUSTERING.md) | Clustering algorithm and weights |
| [SOURCE_REGISTRY.md](docs/SOURCE_REGISTRY.md) | Source schema and supported types |
| [SECURITY.md](docs/SECURITY.md) | Auth, RLS, RBAC, secret management |
| [STATUS.md](docs/STATUS.md) | Full implementation status report |
| [KNOWN_LIMITATIONS.md](docs/KNOWN_LIMITATIONS.md) | Current limitations |
| [NEXT_STEPS.md](docs/NEXT_STEPS.md) | Prioritized engineering roadmap |
| [HANDOFF_TO_CLAUDE_CODE.md](docs/HANDOFF_TO_CLAUDE_CODE.md) | Developer handoff guide |

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Radix UI
- React Router v6, React Query
- Supabase (PostgreSQL, Edge Functions, Auth)
- Deno (edge function runtime)

## License

See repository for license details.
