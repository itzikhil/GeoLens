import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/lib/region-data";
import { useRegionFilter } from "@/contexts/RegionContext";
import { ArrowRight, Layers, Users, Radio } from "lucide-react";

export default function Regions() {
  const { activeRegion } = useRegionFilter();
  const regions = activeRegion ? REGIONS.filter(r => r.slug === activeRegion.slug) : REGIONS;

  const { data: clusterData } = useQuery({
    queryKey: ["region-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_clusters")
        .select("region_tags, country_tags, topic_tags, status")
        .in("status", ["active", "emerging", "ongoing"]);
      if (error) throw error;
      return data;
    },
  });

  const { data: itemData } = useQuery({
    queryKey: ["region-items-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("region_tags")
        .limit(1000);
      if (error) throw error;
      return data;
    },
  });

  const { data: actorData } = useQuery({
    queryKey: ["region-actors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actors")
        .select("name, region_tags, actor_type")
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const getRegionStats = (region: typeof REGIONS[0]) => {
    const matchTag = (tags: string[] | null) => (tags || []).some(t => {
      const l = t.toLowerCase();
      return region.name.toLowerCase() === l || region.countries.some(c => c.toLowerCase() === l);
    });

    const matchedClusters = (clusterData || []).filter(c => matchTag(c.region_tags) || matchTag(c.country_tags));
    const clusterCount = matchedClusters.length;
    const actorCount = (actorData || []).filter(a => matchTag(a.region_tags)).length;
    const itemCount = (itemData || []).filter(i => matchTag(i.region_tags)).length;
    const topTopics = [...new Set(matchedClusters.flatMap(c => c.topic_tags || []))].slice(0, 4);
    const topActors = (actorData || []).filter(a => matchTag(a.region_tags)).slice(0, 3);

    return { clusterCount, actorCount, itemCount, topTopics, topActors };
  };

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
          const stats = getRegionStats(region);

          return (
            <Link key={region.slug} to={`/regions/${region.slug}`} className="intel-card space-y-3 group">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                  <span>{region.emoji}</span> {region.name}
                </h3>
                <div className="flex items-center gap-1">
                  {stats.clusterCount > 0 && <span className="intel-badge-active">{stats.clusterCount} active</span>}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Layers className="h-3 w-3 text-muted-foreground" />
                    <p className="text-lg font-mono font-bold">{stats.clusterCount}</p>
                  </div>
                  <p className="data-label">Clusters</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <p className="text-lg font-mono font-bold">{stats.actorCount}</p>
                  </div>
                  <p className="data-label">Actors</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Radio className="h-3 w-3 text-muted-foreground" />
                    <p className="text-lg font-mono font-bold">{stats.itemCount}</p>
                  </div>
                  <p className="data-label">Items</p>
                </div>
              </div>

              {stats.topActors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {stats.topActors.map(a => (
                    <span key={a.name} className="text-xs px-1.5 py-0.5 rounded font-mono bg-accent/15 text-accent">{a.name}</span>
                  ))}
                </div>
              )}

              {stats.topTopics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {stats.topTopics.map(t => (
                    <span key={t} className="text-xs px-1.5 py-0.5 rounded font-mono bg-primary/10 text-primary">{t}</span>
                  ))}
                </div>
              )}

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
