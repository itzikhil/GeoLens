# Known Limitations

## Data Layer
1. **Demo data dependency** — Most frontend pages render hardcoded demo data from `src/lib/demo-data.ts` instead of querying the database
2. **No scheduled ingestion** — No cron job or scheduler; ingestion must be triggered manually via edge function calls
3. **Regex-based RSS parsing** — No proper XML/DOM parser available in Deno edge functions; may fail on malformed feeds
4. **1000-row query limit** — Supabase default; queries for large datasets may silently truncate results

## Clustering
5. **No semantic similarity** — Clustering relies entirely on tag overlap (Jaccard), not content meaning
6. **Untuned threshold** — The 0.35 assignment threshold is a heuristic, not empirically validated
7. **No auto-decay** — Clusters don't automatically transition from active → cooled → archived
8. **No cross-cluster dedup** — Similar clusters are not detected or suggested for merging

## Enrichment
9. **No translation** — Non-English items are processed but not translated
10. **No transcription** — Audio/video content is not transcribed
11. **No credibility scoring** — Field exists but is never populated
12. **No stance detection** — Field exists but is never populated

## Frontend
13. **Watchlists stub** — Page exists but has no CRUD functionality
14. **No real-time updates** — Feed page doesn't use Supabase Realtime
15. **No export/download** — No way to export data as CSV, PDF, or via API
16. **No mobile optimization** — Sidebar-based layout is not optimized for small screens

## Security
17. **analyst role unused** — Has no differentiated permissions from the default user role
18. **Edge functions have no auth** — They use service role key and accept calls from any origin
19. **No rate limiting on edge functions** — Could be abused if exposed publicly

## Infrastructure
20. **No monitoring/alerting** — No structured logging, error tracking, or health checks
21. **No CI/CD** — No automated tests, linting, or deployment pipeline
22. **Daily brief is placeholder** — `generate-daily-brief` returns a stub response
