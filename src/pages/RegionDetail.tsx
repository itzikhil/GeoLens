import { useParams, Link } from "react-router-dom";
import { findRegionBySlug, findSubregionBySlug } from "@/lib/region-data";
import { DEMO_CLUSTERS, DEMO_ACTORS, DEMO_ITEMS } from "@/lib/demo-data";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TagList } from "@/components/shared/TagList";
import { MapPin, Users, Layers, Radio, ArrowRight, Clock } from "lucide-react";

export default function RegionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const region = findRegionBySlug(slug || '');
  const subResult = !region ? findSubregionBySlug(slug || '') : undefined;

  const displayName = region?.name || subResult?.subregion.name || slug;
  const countries = region?.countries || subResult?.subregion.countries || [];
  const subregions = region?.subregions || [];
  const emoji = region?.emoji || subResult?.region.emoji || '🌍';

  // Filter demo data by region/country match
  const matchTag = (tags: string[]) =>
    tags.some(t => {
      const l = t.toLowerCase();
      if (displayName.toLowerCase() === l) return true;
      return countries.some(c => c.toLowerCase() === l);
    });

  const clusters = DEMO_CLUSTERS.filter(c => matchTag(c.region_tags) || matchTag(c.country_tags || []));
  const actors = DEMO_ACTORS.filter(a => matchTag(a.region_tags));
  const items = DEMO_ITEMS.filter(i => matchTag(i.region_tags));

  // Compute stats
  const topTopics = [...new Set(clusters.flatMap(c => c.topic_tags))].slice(0, 6);
  const sourceTypes = [...new Set(items.map(i => i.source_type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {subResult && (
              <Link to={`/regions/${subResult.region.slug}`} className="data-label hover:text-primary transition-colors">
                {subResult.region.name} →
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span>{emoji}</span> {displayName}
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {countries.length} countries · {clusters.length} active clusters · {items.length} recent items
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="intel-card py-3 text-center">
          <Layers className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-mono font-bold">{clusters.length}</p>
          <p className="data-label">Clusters</p>
        </div>
        <div className="intel-card py-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-accent" />
          <p className="text-xl font-mono font-bold">{actors.length}</p>
          <p className="data-label">Actors</p>
        </div>
        <div className="intel-card py-3 text-center">
          <Radio className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-mono font-bold">{items.length}</p>
          <p className="data-label">Items</p>
        </div>
        <div className="intel-card py-3 text-center">
          <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xl font-mono font-bold">{sourceTypes.length}</p>
          <p className="data-label">Source Types</p>
        </div>
      </div>

      {/* Subregions */}
      {subregions.length > 0 && (
        <div>
          <h2 className="section-header">Subregions</h2>
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            {subregions.map(sub => (
              <Link key={sub.slug} to={`/regions/${sub.slug}`} className="intel-card py-3 flex items-center justify-between group">
                <div>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">{sub.name}</span>
                  <p className="text-xs text-muted-foreground font-mono">{sub.countries.length} countries</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Countries */}
      {countries.length > 0 && (
        <div>
          <h2 className="section-header">Countries</h2>
          <div className="flex flex-wrap gap-2">
            {countries.map(c => (
              <Link key={c} to={`/countries/${encodeURIComponent(c.toLowerCase().replace(/\s+/g, '-'))}`} className="text-xs px-2.5 py-1.5 rounded-md font-mono bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                {c}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Clusters */}
      {clusters.length > 0 && (
        <div>
          <h2 className="section-header">Active Clusters</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {clusters.map(cluster => (
              <Link key={cluster.id} to={`/clusters/${cluster.slug}`} className="intel-card space-y-2 group">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{cluster.title}</h3>
                  <StatusBadge status={cluster.status} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{cluster.description}</p>
                <div className="flex items-center gap-3">
                  <ScoreIndicator label="SIG" value={cluster.significance_score} />
                  <ScoreIndicator label="CON" value={cluster.confidence_score} />
                  <span className="text-xs text-muted-foreground font-mono ml-auto">{cluster.item_count} items</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top Actors */}
      {actors.length > 0 && (
        <div>
          <h2 className="section-header">Key Actors</h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {actors.map(actor => (
              <div key={actor.id} className="intel-card py-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">{actor.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{actor.actor_type}</span>
                </div>
                <span className="text-xs font-mono text-primary">{actor.mentions} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topics & Source Mix */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="section-header">Top Topics</h2>
          <TagList tags={topTopics} variant="topic" />
        </div>
        <div>
          <h2 className="section-header">Source Mix</h2>
          <div className="flex flex-wrap gap-2">
            {sourceTypes.map(st => (
              <span key={st} className="text-xs px-2 py-1 rounded font-mono bg-secondary text-muted-foreground">{st}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {items.length > 0 && (
        <div>
          <h2 className="section-header">Recent Timeline</h2>
          <div className="space-y-2">
            {items.slice(0, 8).map(item => (
              <div key={item.id} className="flex items-start gap-3 intel-card py-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-primary">{item.source_name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.summary_short}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
