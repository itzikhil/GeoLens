# Enrichment Pipeline

## Overview

Enrichment lives in `supabase/functions/enrich-item/index.ts`. It processes pending items through AI extraction and then assigns them to event clusters.

## AI Enrichment (implemented)

Uses the Lovable AI Gateway (`ai.gateway.lovable.dev`) with `google/gemini-3-flash-preview` model.

### Extracted fields
| Field | Status | Description |
|-------|--------|-------------|
| `topic_tags` | ✅ | Topics: military, diplomacy, trade, energy, sanctions, etc. |
| `actor_tags` | ✅ | Named actors: countries, organizations, leaders |
| `country_tags` | ✅ | Countries directly involved |
| `region_tags` | ✅ | Mapped to 14 standard regions |
| `summary_short` | ✅ | One-sentence intelligence summary (max 200 chars) |
| `importance_score` | ✅ | Geopolitical importance 0.0–1.0 |
| `sentiment_label` | ✅ | positive / negative / neutral / mixed |

### Not yet implemented
| Field | Status | Description |
|-------|--------|-------------|
| `summary_long` | 🔲 | Extended multi-paragraph summary |
| `stance_label` | 🔲 | Stance detection (pro/anti/neutral toward actors) |
| `credibility_score` | 🔲 | Cross-reference credibility assessment |
| `translated_content` | 🔲 | Translation for non-English items |
| `transcript` | 🔲 | Audio/video transcription |
| `why_this_matters` | 🔲 | Contextual significance explanation |

## Enrichment Flow

1. Check if item lacks tags/summary AND API key is available
2. Call AI Gateway with function calling (structured output)
3. Parse tool call response and update item fields
4. Fall through to clustering regardless of AI success

## Error Handling

- AI enrichment failure is non-fatal — logs error and continues with rule-based clustering
- Items are always marked `completed` after processing, even if AI fails
- Batch mode processes up to 50 pending items per invocation
