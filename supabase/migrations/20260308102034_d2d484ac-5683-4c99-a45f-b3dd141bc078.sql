-- Add partial_success to job_status enum
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'partial_success' AFTER 'completed';

-- Add diagnostic columns to ingestion_jobs
ALTER TABLE public.ingestion_jobs
  ADD COLUMN IF NOT EXISTS items_fetched integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS items_inserted integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS items_skipped_duplicate integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3;

-- Add rate_limit_seconds and last_successful_ingest to sources
ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS rate_limit_seconds integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS last_successful_ingest_at timestamp with time zone;