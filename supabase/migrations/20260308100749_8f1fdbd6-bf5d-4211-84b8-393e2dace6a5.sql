
-- Create enums
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'user');
CREATE TYPE public.source_type AS ENUM ('mainstream', 'niche', 'think_tank', 'government', 'x', 'telegram', 'youtube', 'podcast', 'rss', 'api', 'custom');
CREATE TYPE public.media_type AS ENUM ('article', 'post', 'thread', 'video', 'podcast_episode', 'telegram_message', 'report');
CREATE TYPE public.cluster_status AS ENUM ('emerging', 'active', 'ongoing', 'cooled', 'archived');
CREATE TYPE public.actor_type AS ENUM ('country', 'government', 'military', 'company', 'militia', 'political_figure', 'institution', 'shipping_actor', 'energy_actor', 'media_actor');
CREATE TYPE public.ingestion_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'skipped');
CREATE TYPE public.watchlist_entity_type AS ENUM ('region', 'country', 'actor', 'topic', 'source', 'event_cluster');
CREATE TYPE public.job_status AS ENUM ('queued', 'running', 'completed', 'failed', 'cancelled');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Sources
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  source_type source_type NOT NULL DEFAULT 'rss',
  base_url TEXT,
  rss_url TEXT,
  external_id TEXT,
  region_tags TEXT[] DEFAULT '{}',
  country_tags TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'en',
  reliability_score NUMERIC(3,2) DEFAULT 0.50,
  bias_label TEXT,
  notes TEXT,
  ingest_method TEXT,
  is_active BOOLEAN DEFAULT true,
  last_ingested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sources readable by authenticated" ON public.sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage sources" ON public.sources FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Items
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  external_item_id TEXT,
  title TEXT NOT NULL,
  url TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  content_raw TEXT,
  content_clean TEXT,
  summary_short TEXT,
  summary_long TEXT,
  language TEXT DEFAULT 'en',
  translated_content TEXT,
  source_type source_type,
  media_type media_type DEFAULT 'article',
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  transcript TEXT,
  region_tags TEXT[] DEFAULT '{}',
  country_tags TEXT[] DEFAULT '{}',
  topic_tags TEXT[] DEFAULT '{}',
  actor_tags TEXT[] DEFAULT '{}',
  sentiment_label TEXT,
  stance_label TEXT,
  credibility_score NUMERIC(3,2),
  importance_score NUMERIC(3,2),
  duplicate_of_item_id UUID REFERENCES public.items(id),
  ingestion_status ingestion_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Items readable by authenticated" ON public.items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage items" ON public.items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_items_published_at ON public.items(published_at DESC);
CREATE INDEX idx_items_source_id ON public.items(source_id);
CREATE INDEX idx_items_region_tags ON public.items USING GIN(region_tags);
CREATE INDEX idx_items_country_tags ON public.items USING GIN(country_tags);
CREATE INDEX idx_items_topic_tags ON public.items USING GIN(topic_tags);
CREATE INDEX idx_items_actor_tags ON public.items USING GIN(actor_tags);

-- Event clusters
CREATE TABLE public.event_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status cluster_status DEFAULT 'emerging',
  region_tags TEXT[] DEFAULT '{}',
  country_tags TEXT[] DEFAULT '{}',
  topic_tags TEXT[] DEFAULT '{}',
  actor_tags TEXT[] DEFAULT '{}',
  confidence_score NUMERIC(3,2),
  significance_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.event_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clusters readable" ON public.event_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage clusters" ON public.event_clusters FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Event cluster items
CREATE TABLE public.event_cluster_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_cluster_id UUID REFERENCES public.event_clusters(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  relevance_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_cluster_id, item_id)
);
ALTER TABLE public.event_cluster_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cluster items readable" ON public.event_cluster_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage cluster items" ON public.event_cluster_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Actors
CREATE TABLE public.actors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  actor_type actor_type NOT NULL,
  description TEXT,
  country_tags TEXT[] DEFAULT '{}',
  region_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.actors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Actors readable" ON public.actors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage actors" ON public.actors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Actor relationships
CREATE TABLE public.actor_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_a_id UUID REFERENCES public.actors(id) ON DELETE CASCADE NOT NULL,
  actor_b_id UUID REFERENCES public.actors(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  description TEXT,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.actor_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Actor rels readable" ON public.actor_relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage actor rels" ON public.actor_relationships FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Narratives
CREATE TABLE public.narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  description TEXT,
  region_tags TEXT[] DEFAULT '{}',
  topic_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Narratives readable" ON public.narratives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage narratives" ON public.narratives FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Item narratives
CREATE TABLE public.item_narratives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  narrative_id UUID REFERENCES public.narratives(id) ON DELETE CASCADE NOT NULL,
  confidence_score NUMERIC(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(item_id, narrative_id)
);
ALTER TABLE public.item_narratives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Item narratives readable" ON public.item_narratives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage item narratives" ON public.item_narratives FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Watchlists
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlists" ON public.watchlists FOR ALL USING (auth.uid() = user_id);

-- Watchlist entities
CREATE TABLE public.watchlist_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE NOT NULL,
  entity_type watchlist_entity_type NOT NULL,
  entity_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.watchlist_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlist entities" ON public.watchlist_entities
  FOR ALL USING (EXISTS (SELECT 1 FROM public.watchlists WHERE id = watchlist_id AND user_id = auth.uid()));

-- Analyst notes
CREATE TABLE public.analyst_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_cluster_id UUID REFERENCES public.event_clusters(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.actors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.analyst_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.analyst_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins view all notes" ON public.analyst_notes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Ingestion jobs
CREATE TABLE public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.sources(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL,
  status job_status DEFAULT 'queued',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error_message TEXT,
  stats_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs viewable" ON public.ingestion_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage jobs" ON public.ingestion_jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON public.sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_clusters_updated_at BEFORE UPDATE ON public.event_clusters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_actors_updated_at BEFORE UPDATE ON public.actors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_actor_relationships_updated_at BEFORE UPDATE ON public.actor_relationships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_narratives_updated_at BEFORE UPDATE ON public.narratives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON public.watchlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analyst_notes_updated_at BEFORE UPDATE ON public.analyst_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-assign user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user'); RETURN NEW; END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
