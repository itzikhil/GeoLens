# Source Registry

## Schema

The `sources` table defines all content sources:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Display name |
| `slug` | text | URL-safe identifier |
| `source_type` | enum | mainstream, niche, think_tank, government, x, telegram, youtube, podcast, rss, api, custom |
| `ingest_method` | text | Handler override (rss, api, custom) |
| `base_url` | text | Website URL |
| `rss_url` | text | RSS/Atom feed URL |
| `external_id` | text | Platform-specific ID |
| `region_tags` | text[] | Geographic regions covered |
| `country_tags` | text[] | Countries covered |
| `language` | text | Primary language (ISO 639-1) |
| `reliability_score` | numeric | 0.0–1.0 reliability rating |
| `bias_label` | text | Political bias label |
| `is_active` | boolean | Whether ingestion is enabled |
| `rate_limit_seconds` | integer | Minimum seconds between ingestions |
| `last_ingested_at` | timestamptz | Last ingestion attempt |
| `last_successful_ingest_at` | timestamptz | Last successful ingestion |

## Supported Source Types

### Fully operational (RSS-based)
- **Mainstream media**: Reuters, AP, Al Jazeera, etc.
- **Think tanks**: Carnegie, CSIS, ISW (via RSS feeds)
- **Government**: Official press release RSS feeds
- **Niche**: Specialty outlets with RSS
- **Podcast**: Podcast RSS feeds (media_type overridden to podcast_episode)

### Disabled (placeholder handlers)
- **X / Twitter**: Requires `X_BEARER_TOKEN`
- **Telegram**: Requires `TELEGRAM_BOT_TOKEN`
- **YouTube**: Requires `YOUTUBE_API_KEY`
- **News API**: Requires `NEWS_API_KEY`

## Adding a New Source

1. Insert a row into `sources` with appropriate `source_type`, `ingest_method`, and `rss_url`
2. Set `is_active = true`
3. Call `ingest-source` edge function with `{ source_id: "..." }`
4. Monitor via `ingestion_jobs` table

## Source Templates

Pre-configured templates in `src/lib/source-templates.ts` provide defaults for each source type, including recommended reliability scores, rate limits, and polling intervals.
