import { useParams, Link } from "react-router-dom";
import { findCountryRegion, REGIONS } from "@/lib/region-data";
import { DEMO_CLUSTERS, DEMO_ACTORS, DEMO_ITEMS } from "@/lib/demo-data";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapPin, ArrowLeft, Clock } from "lucide-react";

export default function CountryDetail() {
  const { slug } = useParams<{ slug: string }>();
  
  // Convert slug back to country name
  const allCountries = REGIONS.flatMap(r => [...r.countries, ...r.subregions.flatMap(s => s.countries)]);
  const uniqueCountries = [...new Set(allCountries)];
  const country = uniqueCountries.find(
    c => c.toLowerCase().replace(/\s+/g, '-') === slug
  ) || slug || '';

  const parentRegion = findCountryRegion(country);

  const matchCountry = (tags: string[]) => tags.some(t => t.toLowerCase() === country.toLowerCase());

  const clusters = DEMO_CLUSTERS.filter(c => matchCountry(c.country_tags || []) || matchCountry(c.actor_tags));
  const actors = DEMO_ACTORS.filter(a => a.name.toLowerCase() === country.toLowerCase() || matchCountry(a.region_tags));
  const items = DEMO_ITEMS.filter(i => matchCountry(i.actor_tags) || matchCountry(i.region_tags));

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        {parentRegion && (
          <Link to={`/regions/${parentRegion.slug}`} className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors mb-2">
            <ArrowLeft className="h-3 w-3" />
            {parentRegion.name}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> {country}
        </h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {parentRegion ? `${parentRegion.name} region` : 'Unknown region'} · {clusters.length} clusters · {items.length} items
        </p>
      </div>

      {/* Clusters */}
      {clusters.length > 0 && (
        <div>
          <h2 className="section-header">Related Clusters</h2>
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actors */}
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

      {/* Timeline */}
      {items.length > 0 && (
        <div>
          <h2 className="section-header">Timeline</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-start gap-3 intel-card py-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-primary">{item.source_name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {clusters.length === 0 && items.length === 0 && (
        <div className="intel-card text-center py-12">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No intelligence data yet for {country}</p>
        </div>
      )}
    </div>
  );
}
