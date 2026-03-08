# Next Steps

Prioritized engineering tasks for continued development.

## Priority 1 — Core Functionality

1. **Replace demo data with live queries** — All pages should query Supabase tables instead of rendering `demo-data.ts`
2. **Implement scheduled ingestion** — Use pg_cron or external scheduler to periodically call `ingest-source` for all active sources
3. **Build Watchlists CRUD** — Full create/read/update/delete UI for watchlists and watched entities
4. **Implement `generate-daily-brief`** — AI-powered daily intelligence summary generation

## Priority 2 — Intelligence Quality

5. **Add pgvector + embeddings** — Enable semantic search and embedding-based clustering
6. **Tune clustering algorithm** — Evaluate quality, adjust weights and thresholds, consider hierarchical clustering
7. **Implement translation** — Auto-translate non-English items using AI
8. **Add stance detection** — Classify item stance toward key actors
9. **Implement credibility scoring** — Cross-reference claims across sources

## Priority 3 — User Experience

10. **Real-time feed** — Supabase Realtime subscriptions for live updates
11. **Source health dashboard** — Monitor feed freshness, error rates, ingestion stats
12. **Export capabilities** — CSV, PDF, shareable links for clusters and briefings
13. **Notification/alerting** — Email or in-app alerts for watchlist matches

## Priority 4 — Infrastructure

14. **Add test coverage** — Unit tests for ingestion, enrichment, clustering logic
15. **CI/CD pipeline** — GitHub Actions for linting, testing, deployment
