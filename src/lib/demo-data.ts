// Demo data for GeoLens UI

export const DEMO_SOURCES = [
  { id: '1', name: 'Reuters', slug: 'reuters', source_type: 'mainstream', base_url: 'https://reuters.com', rss_url: 'https://feeds.reuters.com/reuters/topNews', language: 'en', region_tags: ['Global'], reliability_score: 0.92, bias_label: 'Center', is_active: true },
  { id: '2', name: 'Associated Press', slug: 'ap', source_type: 'mainstream', base_url: 'https://apnews.com', rss_url: 'https://rsshub.app/apnews/topics/apf-topnews', language: 'en', region_tags: ['Global'], reliability_score: 0.90, bias_label: 'Center', is_active: true },
  { id: '3', name: 'Financial Times', slug: 'ft', source_type: 'mainstream', base_url: 'https://ft.com', rss_url: null, language: 'en', region_tags: ['Europe', 'Global'], reliability_score: 0.88, bias_label: 'Center-Right', is_active: true },
  { id: '4', name: 'Al Jazeera', slug: 'aljazeera', source_type: 'mainstream', base_url: 'https://aljazeera.com', rss_url: 'https://aljazeera.com/xml/rss/all.xml', language: 'en', region_tags: ['Middle East', 'Global'], reliability_score: 0.78, bias_label: 'Center-Left', is_active: true },
  { id: '5', name: 'Carnegie Endowment', slug: 'carnegie', source_type: 'think_tank', base_url: 'https://carnegieendowment.org', rss_url: null, language: 'en', region_tags: ['Global'], reliability_score: 0.85, bias_label: 'Center', is_active: true },
  { id: '6', name: 'CSIS', slug: 'csis', source_type: 'think_tank', base_url: 'https://csis.org', rss_url: null, language: 'en', region_tags: ['Global'], reliability_score: 0.86, bias_label: 'Center', is_active: true },
  { id: '7', name: 'ISW', slug: 'isw', source_type: 'think_tank', base_url: 'https://understandingwar.org', rss_url: null, language: 'en', region_tags: ['Russia / Eurasia', 'Middle East'], reliability_score: 0.84, bias_label: null, is_active: true },
  { id: '8', name: 'The Economist', slug: 'economist', source_type: 'mainstream', base_url: 'https://economist.com', rss_url: null, language: 'en', region_tags: ['Global'], reliability_score: 0.87, bias_label: 'Center-Right', is_active: true },
  { id: '9', name: 'GeoWatch YouTube', slug: 'geowatch-yt', source_type: 'youtube', base_url: 'https://youtube.com', rss_url: null, language: 'en', region_tags: ['Global'], reliability_score: 0.65, bias_label: null, is_active: false },
  { id: '10', name: 'OSINT Telegram', slug: 'osint-tg', source_type: 'telegram', base_url: null, rss_url: null, language: 'en', region_tags: ['Russia / Eurasia'], reliability_score: 0.55, bias_label: null, is_active: false },
];

export const DEMO_ITEMS = [
  { id: '1', title: 'NATO allies weigh expanded air defense package for Eastern Europe', source_name: 'Reuters', source_type: 'mainstream', media_type: 'article', published_at: '2026-03-08T09:30:00Z', region_tags: ['Europe'], topic_tags: ['military', 'defense'], actor_tags: ['NATO', 'Poland'], credibility_score: 0.88, importance_score: 0.82, summary_short: 'Alliance members discuss significant expansion of integrated air defense systems along eastern flank.' },
  { id: '2', title: 'Red Sea shipping disruptions reach new peak amid Houthi escalation', source_name: 'Financial Times', source_type: 'mainstream', media_type: 'article', published_at: '2026-03-08T08:15:00Z', region_tags: ['Middle East'], topic_tags: ['maritime', 'trade'], actor_tags: ['Houthis', 'Iran'], credibility_score: 0.85, importance_score: 0.90, summary_short: 'Commercial shipping rerouting costs surge as attacks on vessels intensify in Bab el-Mandeb strait.' },
  { id: '3', title: 'Beijing signals flexibility on South China Sea code of conduct', source_name: 'Associated Press', source_type: 'mainstream', media_type: 'article', published_at: '2026-03-08T07:00:00Z', region_tags: ['East Asia', 'Southeast Asia'], topic_tags: ['diplomacy', 'maritime'], actor_tags: ['China', 'ASEAN'], credibility_score: 0.82, importance_score: 0.78, summary_short: 'Chinese foreign ministry spokesperson hints at willingness to resume multilateral negotiations on disputed waters.' },
  { id: '4', title: 'ISW Assessment: Russian offensive operations in Donetsk Oblast', source_name: 'ISW', source_type: 'think_tank', media_type: 'report', published_at: '2026-03-07T22:00:00Z', region_tags: ['Russia / Eurasia'], topic_tags: ['military', 'conflict'], actor_tags: ['Russia', 'Ukraine'], credibility_score: 0.84, importance_score: 0.86, summary_short: 'Russian forces continue incremental advances near Pokrovsk amid personnel and equipment constraints.' },
  { id: '5', title: 'EU sanctions package targets third-country circumvention networks', source_name: 'The Economist', source_type: 'mainstream', media_type: 'article', published_at: '2026-03-07T18:30:00Z', region_tags: ['Europe'], topic_tags: ['sanctions', 'trade'], actor_tags: ['EU', 'Russia'], credibility_score: 0.86, importance_score: 0.75, summary_short: 'New measures aim to close loopholes exploited by intermediary firms in Central Asia and the Caucasus.' },
  { id: '6', title: 'Horn of Africa drought displaces 2.1M as humanitarian aid stalls', source_name: 'Al Jazeera', source_type: 'mainstream', media_type: 'article', published_at: '2026-03-07T14:00:00Z', region_tags: ['Horn of Africa'], topic_tags: ['humanitarian', 'climate'], actor_tags: ['Ethiopia', 'Somalia'], credibility_score: 0.80, importance_score: 0.72, summary_short: 'Consecutive failed rainy seasons compound food insecurity crisis across Ethiopia, Somalia, and Kenya.' },
  { id: '7', title: 'OPEC+ emergency meeting called as oil demand forecasts diverge', source_name: 'Reuters', source_type: 'mainstream', media_type: 'article', published_at: '2026-03-07T11:00:00Z', region_tags: ['Middle East', 'Global'], topic_tags: ['energy', 'trade'], actor_tags: ['OPEC+', 'Saudi Arabia'], credibility_score: 0.90, importance_score: 0.85, summary_short: 'Cartel members to discuss production adjustments amid conflicting signals from major consuming economies.' },
  { id: '8', title: 'India-Pakistan border tensions ease after back-channel talks', source_name: 'Carnegie Endowment', source_type: 'think_tank', media_type: 'report', published_at: '2026-03-07T09:00:00Z', region_tags: ['South Asia'], topic_tags: ['diplomacy', 'military'], actor_tags: ['India', 'Pakistan'], credibility_score: 0.83, importance_score: 0.70, summary_short: 'Quiet diplomatic exchanges lower temperature after weeks of military posturing along Line of Control.' },
];

export const DEMO_CLUSTERS = [
  { id: '1', title: 'Red Sea Maritime Crisis', slug: 'red-sea-crisis', description: 'Escalating Houthi attacks on commercial shipping through Bab el-Mandeb strait, triggering global supply chain disruptions and military responses.', status: 'active' as const, region_tags: ['Middle East'], country_tags: ['Yemen'], topic_tags: ['maritime', 'trade', 'military'], actor_tags: ['Houthis', 'Iran', 'US Navy'], significance_score: 0.92, confidence_score: 0.88, item_count: 47, source_diversity: 8 },
  { id: '2', title: 'NATO Eastern Flank Reinforcement', slug: 'nato-eastern-flank', description: 'Alliance-wide buildup of air defense and ground forces along borders with Russia and Belarus.', status: 'active' as const, region_tags: ['Europe', 'Russia / Eurasia'], country_tags: ['Poland', 'Baltic States'], topic_tags: ['military', 'defense', 'alliance'], actor_tags: ['NATO', 'Russia', 'Poland'], significance_score: 0.85, confidence_score: 0.82, item_count: 32, source_diversity: 6 },
  { id: '3', title: 'South China Sea Diplomatic Thaw', slug: 'scs-diplomatic-thaw', description: 'Emerging signals of renewed engagement between China and ASEAN on maritime code of conduct.', status: 'emerging' as const, region_tags: ['East Asia', 'Southeast Asia'], country_tags: ['China', 'Philippines'], topic_tags: ['diplomacy', 'maritime'], actor_tags: ['China', 'ASEAN', 'Philippines'], significance_score: 0.72, confidence_score: 0.65, item_count: 14, source_diversity: 5 },
  { id: '4', title: 'Russia-Ukraine Donetsk Offensive', slug: 'donetsk-offensive', description: 'Continued Russian ground operations targeting Pokrovsk axis with incremental territorial gains.', status: 'ongoing' as const, region_tags: ['Russia / Eurasia'], country_tags: ['Ukraine', 'Russia'], topic_tags: ['conflict', 'military'], actor_tags: ['Russia', 'Ukraine'], significance_score: 0.88, confidence_score: 0.90, item_count: 89, source_diversity: 12 },
  { id: '5', title: 'EU Sanctions Circumvention Crackdown', slug: 'eu-sanctions-crackdown', description: 'European Union targeting third-country intermediaries enabling sanctions evasion.', status: 'emerging' as const, region_tags: ['Europe'], country_tags: ['EU'], topic_tags: ['sanctions', 'trade', 'enforcement'], actor_tags: ['EU', 'Russia'], significance_score: 0.68, confidence_score: 0.72, item_count: 11, source_diversity: 4 },
  { id: '6', title: 'OPEC+ Production Uncertainty', slug: 'opec-production', description: 'Divergent demand forecasts creating instability within the OPEC+ production agreement framework.', status: 'active' as const, region_tags: ['Middle East', 'Global'], country_tags: ['Saudi Arabia', 'UAE'], topic_tags: ['energy', 'trade'], actor_tags: ['OPEC+', 'Saudi Arabia', 'Russia'], significance_score: 0.80, confidence_score: 0.76, item_count: 23, source_diversity: 7 },
  { id: '7', title: 'Horn of Africa Humanitarian Emergency', slug: 'horn-africa-crisis', description: 'Compounding drought, conflict, and aid shortfalls across Ethiopia, Somalia, and Kenya.', status: 'ongoing' as const, region_tags: ['Horn of Africa'], country_tags: ['Ethiopia', 'Somalia', 'Kenya'], topic_tags: ['humanitarian', 'climate', 'conflict'], actor_tags: ['Ethiopia', 'Somalia'], significance_score: 0.75, confidence_score: 0.85, item_count: 28, source_diversity: 6 },
];

export const DEMO_REGIONS = [
  { name: 'North America', activeEvents: 5, totalItems: 34, actors: 12, sources: 8, topTopics: ['trade', 'tech', 'defense'] },
  { name: 'Latin America', activeEvents: 3, totalItems: 18, actors: 8, sources: 5, topTopics: ['political', 'trade', 'energy'] },
  { name: 'Europe', activeEvents: 8, totalItems: 67, actors: 22, sources: 14, topTopics: ['defense', 'sanctions', 'energy'] },
  { name: 'Russia / Eurasia', activeEvents: 6, totalItems: 89, actors: 15, sources: 11, topTopics: ['conflict', 'military', 'sanctions'] },
  { name: 'Middle East', activeEvents: 9, totalItems: 72, actors: 18, sources: 12, topTopics: ['maritime', 'energy', 'conflict'] },
  { name: 'North Africa', activeEvents: 2, totalItems: 12, actors: 6, sources: 4, topTopics: ['political', 'migration', 'energy'] },
  { name: 'Sub-Saharan Africa', activeEvents: 4, totalItems: 22, actors: 10, sources: 6, topTopics: ['conflict', 'political', 'resources'] },
  { name: 'Horn of Africa', activeEvents: 5, totalItems: 28, actors: 8, sources: 6, topTopics: ['humanitarian', 'conflict', 'climate'] },
  { name: 'South Asia', activeEvents: 4, totalItems: 25, actors: 9, sources: 7, topTopics: ['diplomacy', 'military', 'trade'] },
  { name: 'East Asia', activeEvents: 6, totalItems: 45, actors: 14, sources: 10, topTopics: ['maritime', 'trade', 'tech'] },
  { name: 'Southeast Asia', activeEvents: 3, totalItems: 19, actors: 7, sources: 5, topTopics: ['diplomacy', 'trade', 'maritime'] },
  { name: 'Oceania', activeEvents: 1, totalItems: 8, actors: 4, sources: 3, topTopics: ['security', 'climate', 'alliance'] },
  { name: 'Arctic / Maritime', activeEvents: 2, totalItems: 11, actors: 5, sources: 4, topTopics: ['maritime', 'resources', 'military'] },
];

export const DEMO_ACTORS = [
  { id: '1', name: 'Russia', slug: 'russia', actor_type: 'country', region_tags: ['Russia / Eurasia'], mentions: 142, related_clusters: 4 },
  { id: '2', name: 'China', slug: 'china', actor_type: 'country', region_tags: ['East Asia'], mentions: 98, related_clusters: 3 },
  { id: '3', name: 'United States', slug: 'usa', actor_type: 'country', region_tags: ['North America'], mentions: 115, related_clusters: 5 },
  { id: '4', name: 'NATO', slug: 'nato', actor_type: 'institution', region_tags: ['Europe', 'North America'], mentions: 67, related_clusters: 2 },
  { id: '5', name: 'Iran', slug: 'iran', actor_type: 'country', region_tags: ['Middle East'], mentions: 54, related_clusters: 2 },
  { id: '6', name: 'Houthis', slug: 'houthis', actor_type: 'militia', region_tags: ['Middle East'], mentions: 47, related_clusters: 1 },
  { id: '7', name: 'OPEC+', slug: 'opec-plus', actor_type: 'institution', region_tags: ['Middle East', 'Global'], mentions: 38, related_clusters: 1 },
  { id: '8', name: 'European Union', slug: 'eu', actor_type: 'institution', region_tags: ['Europe'], mentions: 72, related_clusters: 3 },
  { id: '9', name: 'Ukraine', slug: 'ukraine', actor_type: 'country', region_tags: ['Russia / Eurasia'], mentions: 89, related_clusters: 2 },
  { id: '10', name: 'Saudi Arabia', slug: 'saudi-arabia', actor_type: 'country', region_tags: ['Middle East'], mentions: 31, related_clusters: 1 },
  { id: '11', name: 'ASEAN', slug: 'asean', actor_type: 'institution', region_tags: ['Southeast Asia'], mentions: 22, related_clusters: 1 },
  { id: '12', name: 'India', slug: 'india', actor_type: 'country', region_tags: ['South Asia'], mentions: 28, related_clusters: 1 },
];

export const DEMO_NARRATIVES = [
  { id: '1', label: 'Military Escalation', description: 'Framing around build-ups, provocations, and potential conflict escalation between state actors.', item_count: 34, source_types: ['mainstream', 'think_tank', 'government'] },
  { id: '2', label: 'Sanctions Pressure', description: 'Narratives around economic coercion, enforcement gaps, and circumvention networks.', item_count: 22, source_types: ['mainstream', 'think_tank'] },
  { id: '3', label: 'Maritime Disruption', description: 'Coverage of shipping lane threats, naval operations, and trade route vulnerabilities.', item_count: 28, source_types: ['mainstream', 'niche', 'government'] },
  { id: '4', label: 'Energy Leverage', description: 'Framing of energy production/pricing as geopolitical tools and market manipulation.', item_count: 19, source_types: ['mainstream', 'think_tank'] },
  { id: '5', label: 'Alliance Realignment', description: 'Stories about shifting alliances, new partnerships, and bloc dynamics.', item_count: 15, source_types: ['mainstream', 'think_tank'] },
  { id: '6', label: 'Information Warfare', description: 'Narratives around disinformation campaigns, cyber operations, and media manipulation.', item_count: 12, source_types: ['think_tank', 'niche', 'x'] },
  { id: '7', label: 'Proxy Conflict', description: 'Framing of conflicts as extensions of great power competition through local actors.', item_count: 25, source_types: ['mainstream', 'think_tank'] },
  { id: '8', label: 'Supply Chain Stress', description: 'Coverage of disruptions to global trade networks and critical resource flows.', item_count: 17, source_types: ['mainstream', 'niche'] },
  { id: '9', label: 'Regime Stability', description: 'Narratives questioning internal stability of governments under pressure.', item_count: 9, source_types: ['think_tank', 'niche'] },
  { id: '10', label: 'Election Influence', description: 'Stories about foreign interference, domestic manipulation, and electoral integrity.', item_count: 8, source_types: ['mainstream', 'think_tank', 'x'] },
];

export const DEMO_JOBS = [
  { id: '1', source_name: 'Reuters', job_type: 'rss_ingest', status: 'completed' as const, started_at: '2026-03-08T09:00:00Z', finished_at: '2026-03-08T09:02:15Z', items_processed: 12, errors: 0 },
  { id: '2', source_name: 'Associated Press', job_type: 'rss_ingest', status: 'completed' as const, started_at: '2026-03-08T09:00:00Z', finished_at: '2026-03-08T09:01:45Z', items_processed: 8, errors: 0 },
  { id: '3', source_name: 'ISW', job_type: 'web_scrape', status: 'running' as const, started_at: '2026-03-08T09:15:00Z', finished_at: null, items_processed: 3, errors: 0 },
  { id: '4', source_name: 'Al Jazeera', job_type: 'rss_ingest', status: 'failed' as const, started_at: '2026-03-08T08:00:00Z', finished_at: '2026-03-08T08:00:30Z', items_processed: 0, errors: 1 },
  { id: '5', source_name: 'GeoWatch YouTube', job_type: 'youtube_ingest', status: 'queued' as const, started_at: null, finished_at: null, items_processed: 0, errors: 0 },
];
