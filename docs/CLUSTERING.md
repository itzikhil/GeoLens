# Clustering Algorithm

## Overview

Clustering is part of `supabase/functions/enrich-item/index.ts`. After enrichment, each item is scored against existing clusters and either assigned to the best match or used to seed a new cluster.

## Multi-Signal Scoring

Each item is scored against active/emerging/ongoing clusters from the last 14 days.

### Signal weights
| Signal | Weight | Method |
|--------|--------|--------|
| Actor overlap | 0.30 | Jaccard similarity of `actor_tags` |
| Country overlap | 0.20 | Jaccard similarity of `country_tags` |
| Topic overlap | 0.20 | Jaccard similarity of `topic_tags` |
| Time proximity | 0.20 | Linear decay over 7 days |
| Region overlap | 0.10 | Binary: any overlap = 1.0 |

### Assignment threshold
- Score ≥ 0.35 → assign to best-matching cluster
- Score < 0.35 → create new cluster

## Cluster Lifecycle

| Status | Meaning |
|--------|---------|
| `emerging` | < 10 items, newly created |
| `active` | ≥ 10 items, auto-promoted from emerging |
| `ongoing` | Manually set or long-running |
| `cooled` | No new items for extended period (not yet automated) |
| `archived` | Manually archived or merged away |

## Cluster Metadata

On each item assignment, cluster metadata is recomputed:
- `item_count` incremented
- Tag arrays merged (actors, countries, topics, regions)
- `source_diversity_count` recalculated
- `top_actors`, `top_countries`, `top_topics` updated (top 10 by frequency)

## AI-Generated Summaries

When creating new clusters or via `cluster-admin` regenerate action:
- Uses Lovable AI Gateway to generate: title, description, grouping_rationale, narrative_comparison, significance_score, confidence_score

## Limitations

1. **No semantic similarity** — relies entirely on tag overlap, not content meaning
2. **Threshold not tuned** — 0.35 is a heuristic, may create too many micro-clusters
3. **No cluster decay** — clusters don't automatically transition to `cooled`
4. **No cross-cluster deduplication** — similar clusters aren't detected or merged automatically
5. **Linear time scan** — scores against up to 100 clusters per item (adequate for current scale)
