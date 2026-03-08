# Ingestion Pipeline

## Overview

The ingestion pipeline lives in `supabase/functions/ingest-source/index.ts`. It fetches content from configured sources, deduplicates against existing items, and inserts new items into the `items` table.

## Source Registry

Sources are stored in the `sources` table with key fields:
- `source_type` — enum: mainstream, niche, think_tank, government, x, telegram, youtube, podcast, rss, api, custom
- `ingest_method` — string override for handler routing (e.g., "rss", "api")
- `rss_url` — RSS/Atom feed URL
- `base_url` — Website URL (used for manual URL import)
- `external_id` — Platform-specific ID (channel ID, account handle)
- `rate_limit_seconds` — Minimum interval between ingestion runs
- `is_active` — Boolean toggle

## Handler Mapping

The router selects a handler by `ingest_method` first, then `source_type`:

| Handler | Status | Routed from |
|---------|--------|------------|
| `handleRSS` | ✅ Implemented | `rss`, `mainstream`, `niche`, `think_tank`, `government` |
| `handlePodcast` | ⚠️ Partial | `podcast` (uses RSS + overrides media_type) |
| `handleManualURL` | ⚠️ Partial | `custom` (fetches single URL, extracts OG metadata) |
| `handleNewsAPI` | 🔲 Disabled | `api` (placeholder, requires NEWS_API_KEY) |
| `handleYouTube` | 🔲 Disabled | `youtube` (placeholder, requires YOUTUBE_API_KEY) |
| `handleX` | 🔲 Disabled | `x` (placeholder, requires X_BEARER_TOKEN) |
| `handleTelegram` | 🔲 Disabled | `telegram` (placeholder, requires TELEGRAM_BOT_TOKEN) |

Disabled handlers are tracked in a `DISABLED_HANDLERS` set. If a source routes to a disabled handler, the job is marked `failed` with a descriptive error.

## Deduplication Strategy

1. Fetch all `external_item_id` values from `items` where `source_id` matches
2. Build a Set of existing IDs
3. Filter out items whose `external_item_id` already exists
4. Only insert genuinely new items

The `external_item_id` is derived from: RSS `<guid>` → `<link>` → `<title>` (fallback chain).

## Retry Logic

- Up to 3 retries with exponential backoff (1s, 2s, 4s)
- If all retries fail, job status is set to `failed` with the last error message
- Partial failures (some items inserted, some errored) result in `partial_success` status

## Job Tracking

Every ingestion run creates a record in `ingestion_jobs`:
- `status`: queued → running → completed / partial_success / failed
- `items_fetched`: Total items parsed from source
- `items_inserted`: New items added to DB
- `items_skipped_duplicate`: Items already in DB
- `error_message`: Concatenated error messages
- `stats_json`: Handler status, source type, test mode flag

## Rate Limiting

Before ingestion, the function checks `source.last_ingested_at` against `source.rate_limit_seconds`. If the cooldown hasn't elapsed, the request is skipped with a "rate limited" response. This is bypassed in `test_mode`.

## RSS Parsing

Uses regex-based parsing (no DOM parser available in Deno edge functions):
- Supports RSS 2.0 `<item>` tags and Atom `<entry>` tags
- Extracts: title, link, guid, description, pubDate, author, media thumbnails
- Handles CDATA sections
- Falls back to Atom format if no RSS items found
