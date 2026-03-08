-- Add clustering metadata columns to event_clusters
ALTER TABLE public.event_clusters
  ADD COLUMN IF NOT EXISTS grouping_rationale text,
  ADD COLUMN IF NOT EXISTS narrative_comparison jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS item_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS source_diversity_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS top_actors text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS top_countries text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS top_topics text[] DEFAULT '{}'::text[];