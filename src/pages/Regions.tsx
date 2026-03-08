import { Link } from "react-router-dom";
import { REGIONS } from "@/lib/region-data";
import { DEMO_CLUSTERS, DEMO_ACTORS, DEMO_ITEMS } from "@/lib/demo-data";
import { useRegionFilter } from "@/contexts/RegionContext";
import { Globe, ArrowRight, Layers, Users, Radio } from "lucide-react";

export default function Regions() {
  const { activeRegion } = useRegionFilter();
  const regions = activeRegion ? REGIONS.filter(r => r.slug === activeRegion.slug) : REGIONS;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regions</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Global coverage across {REGIONS.length} regions
          {activeRegion && ` · Filtered to ${activeRegion.name}`}
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => {
          const matchTag = (tags: string[]) => tags.some(t => {
            const l = t.toLowerCase();
            return region.name.toLowerCase() === l || region.countries.some(c => c.toLowerCase() === l);
          });
          const clusterCount = DEMO_CLUSTERS.filter(c => matchTag(c.region_tags) || matchTag(c.country_tags || [])).length;
          const actorCount = DEMO_ACTORS.filter(a => matchTag(a.region_tags)).length;
          const itemCount = DEMO_ITEMS.filter(i => matchTag(i.region_tags)).length;
          const topTopics = [...new Set(
            DEMO_CLUSTERS.filter(c => matchTag(c.region_tags)).flatMap(c => c.topic_tags)
          )].slice(0, 4);
          const topActors = DEMO_ACTORS.filter(a => matchTag(a.region_tags)).slice(0, 3);

          return (
            <Link key={region.slug} to={`/regions/${region.slug}`} className="intel-card space-y-3 group">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <span>{region.emoji}</span> {region.name}
                </h3>
                <div className="flex items-center gap-1">
                  {clusterCount > 0 && <span className="intel-badge-active">{clusterCount} active</span>}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <p className="text-lg font-mono font-bold">{clusterCount}</p>
                  </div>
                  <p className="data-label">Clusters</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <p className="text-lg font-mono font-bold">{actorCount}</p>
                  </div>
                  <p className="data-label">Actors</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Radio className="h-3 w-3 text-muted-foreground" />
                    <p className="text-lg font-mono font-bold">{itemCount}</p>
                  </div>
                  <p className="data-label">Items</p>
                </div>
              </div>

              {/* Top Actors */}
              {topActors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {topActors.map(a => (
                    <span key={a.id} className="text-xs px-1.5 py-0.5 rounded font-mono bg-accent/15 text-accent">{a.name}</span>
                  ))}
                </div>
              )}

              {/* Topics */}
              {topTopics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {topTopics.map(t => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded font-mono bg-primary/10 text-primary">{t}</span>
                  ))}
                </div>
              )}

              {/* Subregions hint */}
              {region.subregions.length > 0 && (
                <p className="text-xs text-muted-foreground font-mono">
                  {region.subregions.map(s => s.name).join(' · ')}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
