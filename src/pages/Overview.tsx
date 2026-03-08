import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TagList } from "@/components/shared/TagList";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { REGIONS } from "@/lib/region-data";

export default function Overview() {
  const { data: clusters, isLoading: clustersLoading } = useQuery({
    queryKey: ["overview-clusters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_clusters")
        .select("id, title, slug, description, status, significance_score, confidence_score, region_tags, item_count")
        .in("status", ["active", "emerging", "ongoing"])
        .order("significance_score", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: recentItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["overview-recent-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("id, title, summary_short, published_at, source_type, importance_score, region_tags, topic_tags, actor_tags")
        .order("published_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: topActors } = useQuery({
    queryKey: ["overview-top-actors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actors")
        .select("id, name, slug, actor_type, region_tags")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: regionActivity } = useQuery({
    queryKey: ["overview-region-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_clusters")
        .select("region_tags, status")
        .in("status", ["active", "emerging", "ongoing"]);
      if (error) throw error;

      const counts: Record<string, number> = {};
      for (const c of data || []) {
        for (const r of c.region_tags || []) {
          counts[r] = (counts[r] || 0) + 1;
        }
      }
      return REGIONS.map(r => ({
        name: r.name,
        emoji: r.emoji,
        slug: r.slug,
        activeEvents: counts[r.name] || 0,
      })).sort((a, b) => b.activeEvents - a.activeEvents);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["overview-stats"],
    queryFn: async () => {
      const [{ count: itemCount }, { count: clusterCount }, { count: sourceCount }] = await Promise.all([
        supabase.from("items").select("*", { count: "exact", head: true }),
        supabase.from("event_clusters").select("*", { count: "exact", head: true }).in("status", ["active", "emerging", "ongoing"]),
        supabase.from("sources").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      return { items: itemCount || 0, clusters: clusterCount || 0, sources: sourceCount || 0 };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Intelligence Overview</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="intel-card py-3 text-center">
            <p className="text-2xl font-mono font-bold">{stats.items}</p>
            <p className="data-label">Items Ingested</p>
          </div>
          <div className="intel-card py-3 text-center">
            <p className="text-2xl font-mono font-bold">{stats.clusters}</p>
            <p className="data-label">Active Clusters</p>
          </div>
          <div className="intel-card py-3 text-center">
            <p className="text-2xl font-mono font-bold">{stats.sources}</p>
            <p className="data-label">Active Sources</p>
          </div>
        </div>
      )}

      {/* Top Event Clusters */}
      <div>
        <h2 className="section-header">Active Event Clusters</h2>
        {clustersLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-md" />)}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(clusters || []).map((cluster) => (
              <Link key={cluster.id} to={`/clusters/${cluster.slug}`} className="intel-card space-y-3 group hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">{cluster.title}</h3>
                  <StatusBadge status={cluster.status || 'emerging'} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{cluster.description}</p>
                <div className="flex items-center gap-3">
                  <ScoreIndicator label="SIG" value={cluster.significance_score || 0} />
                  <ScoreIndicator label="CON" value={cluster.confidence_score || 0} />
                  <span className="text-xs font-mono text-muted-foreground ml-auto">{cluster.item_count || 0} items</span>
                </div>
                <TagList tags={cluster.region_tags || []} variant="region" />
              </Link>
            ))}
            {(clusters || []).length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">No active clusters yet. Run ingestion and enrichment to generate clusters.</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-header mb-0">Recent Items</h2>
          <Link to="/feed" className="text-xs font-mono text-primary hover:underline">View all →</Link>
        </div>
        {itemsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-md" />)}</div>
        ) : (
          <div className="space-y-2">
            {(recentItems || []).map((item) => (
              <div key={item.id} className="intel-card py-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-primary">{item.source_type}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground font-mono">{item.published_at ? getTimeAgo(item.published_at) : '—'}</span>
                  </div>
                  <h3 className="text-sm font-semibold leading-tight truncate">{item.title}</h3>
                  {item.summary_short && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.summary_short}</p>}
                </div>
                {item.importance_score != null && (
                  <ScoreIndicator label="IMP" value={item.importance_score} />
                )}
              </div>
            ))}
            {(recentItems || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No items yet. Run ingestion to populate the feed.</p>
            )}
          </div>
        )}
      </div>

      {/* Regions Overview */}
      <div>
        <h2 className="section-header">Regional Activity</h2>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {(regionActivity || []).map((region) => (
            <Link key={region.slug} to={`/regions/${region.slug}`} className="intel-card py-3 flex items-center justify-between hover:border-primary/30 transition-colors">
              <span className="text-xs font-medium">{region.emoji} {region.name}</span>
              <span className="text-xs font-mono text-muted-foreground">{region.activeEvents} clusters</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Actors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="section-header mb-0">Key Actors</h2>
          <Link to="/actors" className="text-xs font-mono text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {(topActors || []).map((actor) => (
            <div key={actor.id} className="intel-card py-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{actor.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{actor.actor_type}</span>
              </div>
              <div className="flex gap-1">
                {(actor.region_tags || []).slice(0, 2).map(r => (
                  <span key={r} className="text-xs px-1.5 py-0.5 rounded font-mono bg-accent/15 text-accent">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
