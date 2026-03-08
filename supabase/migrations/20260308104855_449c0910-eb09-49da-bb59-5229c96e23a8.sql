
-- Admin audit log for tracking all admin actions
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log" ON public.admin_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- System settings table for prompt templates and scoring rules
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings readable by admins" ON public.system_settings
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Settings editable by admins" ON public.system_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('enrichment_prompt', '{"system_prompt": "You are a geopolitical intelligence analyst. Extract entities, classify topics, assess sentiment, and summarize the geopolitical significance of this item.", "extract_fields": ["actors", "countries", "regions", "topics", "sentiment", "stance", "importance"]}', 'Prompt template for AI item enrichment'),
  ('clustering_rules', '{"actor_weight": 0.30, "time_weight": 0.20, "country_weight": 0.20, "topic_weight": 0.20, "region_weight": 0.10, "min_score_threshold": 0.35, "time_window_hours": 72}', 'Scoring weights and thresholds for event clustering'),
  ('scoring_rules', '{"credibility_factors": ["source_reliability", "corroboration_count", "recency"], "importance_factors": ["actor_significance", "topic_urgency", "regional_impact"], "default_credibility": 0.50, "default_importance": 0.50}', 'Rules for computing credibility and importance scores'),
  ('daily_brief_prompt', '{"system_prompt": "Generate a concise daily intelligence brief summarizing the most significant developments across all tracked regions. Highlight emerging threats, escalation patterns, and notable shifts.", "max_clusters": 10, "include_regions": true, "include_actors": true}', 'Prompt template for daily brief generation'),
  ('ingestion_defaults', '{"rss_poll_minutes": 15, "api_poll_minutes": 30, "social_poll_minutes": 60, "max_retries": 3, "dedup_threshold": 0.85}', 'Default ingestion pipeline configuration');

-- Index for audit log queries
CREATE INDEX idx_audit_log_created ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_audit_log_action ON public.admin_audit_log (action);
