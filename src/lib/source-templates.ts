// Source templates for quick-start source creation

export interface SourceTemplate {
  label: string;
  description: string;
  defaults: Partial<SourceFormData>;
}

export interface SourceFormData {
  name: string;
  source_type: string;
  is_active: boolean;
  base_url: string;
  rss_url: string;
  external_id: string;
  x_handle: string;
  telegram_channel: string;
  youtube_channel_id: string;
  podcast_feed_url: string;
  region_tags: string[];
  country_tags: string[];
  topic_tags: string[];
  language: string;
  reliability_score: number;
  bias_label: string;
  notes: string;
  ingest_method: string;
  rate_limit_seconds: number;
  polling_interval_minutes: number;
}

export const EMPTY_SOURCE: SourceFormData = {
  name: '',
  source_type: 'rss',
  is_active: true,
  base_url: '',
  rss_url: '',
  external_id: '',
  x_handle: '',
  telegram_channel: '',
  youtube_channel_id: '',
  podcast_feed_url: '',
  region_tags: [],
  country_tags: [],
  topic_tags: [],
  language: 'en',
  reliability_score: 0.5,
  bias_label: '',
  notes: '',
  ingest_method: 'rss',
  rate_limit_seconds: 60,
  polling_interval_minutes: 15,
};

export const SOURCE_TEMPLATES: SourceTemplate[] = [
  {
    label: 'Mainstream Media',
    description: 'Major news outlets with RSS feeds (Reuters, AP, BBC, etc.)',
    defaults: {
      source_type: 'mainstream',
      ingest_method: 'rss',
      reliability_score: 0.85,
      rate_limit_seconds: 60,
      polling_interval_minutes: 15,
      language: 'en',
    },
  },
  {
    label: 'Think Tank',
    description: 'Policy research organizations (Carnegie, CSIS, IISS, etc.)',
    defaults: {
      source_type: 'think_tank',
      ingest_method: 'rss',
      reliability_score: 0.82,
      rate_limit_seconds: 300,
      polling_interval_minutes: 60,
      language: 'en',
    },
  },
  {
    label: 'Government Source',
    description: 'Official government publications, press releases, statements',
    defaults: {
      source_type: 'government',
      ingest_method: 'rss',
      reliability_score: 0.75,
      rate_limit_seconds: 300,
      polling_interval_minutes: 60,
      language: 'en',
    },
  },
  {
    label: 'X Account',
    description: 'Twitter/X account or list. Requires X_BEARER_TOKEN secret.',
    defaults: {
      source_type: 'x',
      ingest_method: 'api',
      reliability_score: 0.5,
      rate_limit_seconds: 900,
      polling_interval_minutes: 60,
      language: 'en',
    },
  },
  {
    label: 'Telegram Channel',
    description: 'Telegram public channel. Requires TELEGRAM_BOT_TOKEN secret.',
    defaults: {
      source_type: 'telegram',
      ingest_method: 'api',
      reliability_score: 0.45,
      rate_limit_seconds: 600,
      polling_interval_minutes: 60,
      language: 'en',
    },
  },
  {
    label: 'YouTube Channel',
    description: 'YouTube channel videos. Requires YOUTUBE_API_KEY secret.',
    defaults: {
      source_type: 'youtube',
      ingest_method: 'api',
      reliability_score: 0.6,
      rate_limit_seconds: 600,
      polling_interval_minutes: 120,
      language: 'en',
    },
  },
  {
    label: 'Podcast Feed',
    description: 'Podcast RSS feed for episode ingestion and transcript processing',
    defaults: {
      source_type: 'podcast',
      ingest_method: 'rss',
      reliability_score: 0.6,
      rate_limit_seconds: 600,
      polling_interval_minutes: 120,
      language: 'en',
    },
  },
  {
    label: 'Custom RSS',
    description: 'Any RSS or Atom feed not covered by other templates',
    defaults: {
      source_type: 'rss',
      ingest_method: 'rss',
      reliability_score: 0.5,
      rate_limit_seconds: 120,
      polling_interval_minutes: 30,
      language: 'en',
    },
  },
  {
    label: 'Custom API Source',
    description: 'REST API endpoint returning structured data. Requires custom parsing.',
    defaults: {
      source_type: 'api',
      ingest_method: 'api',
      reliability_score: 0.5,
      rate_limit_seconds: 300,
      polling_interval_minutes: 30,
      language: 'en',
    },
  },
];

export const SOURCE_TYPE_OPTIONS = [
  { value: 'mainstream', label: 'Mainstream' },
  { value: 'niche', label: 'Niche' },
  { value: 'think_tank', label: 'Think Tank' },
  { value: 'government', label: 'Government' },
  { value: 'x', label: 'X / Twitter' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'rss', label: 'RSS' },
  { value: 'api', label: 'API' },
  { value: 'custom', label: 'Custom' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'fa', label: 'Farsi' },
  { value: 'he', label: 'Hebrew' },
  { value: 'tr', label: 'Turkish' },
  { value: 'hi', label: 'Hindi' },
];

export const BIAS_OPTIONS = [
  '', 'Center', 'Center-Left', 'Center-Right', 'Left', 'Right',
  'Pro-Government', 'Pro-Opposition', 'State-Affiliated', 'Independent',
];

export const REGION_OPTIONS = [
  'Global', 'North America', 'Latin America', 'Europe', 'Russia / Eurasia',
  'Middle East', 'North Africa', 'Sub-Saharan Africa', 'Horn of Africa',
  'South Asia', 'East Asia', 'Southeast Asia', 'Oceania', 'Arctic / Maritime',
];
