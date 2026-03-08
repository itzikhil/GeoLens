import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Actors() {
  const { data: actors, isLoading } = useQuery({
    queryKey: ["actors-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("actors")
        .select("id, name, slug, actor_type, region_tags, country_tags, description")
        .order("name");
      if (error) throw error;

      // Get mention counts from items actor_tags
      const { data: items } = await supabase
        .from("items")
        .select("actor_tags")
        .limit(1000);

      const mentionCounts: Record<string, number> = {};
      for (const item of items || []) {
        for (const tag of item.actor_tags || []) {
          const key = tag.toLowerCase();
          mentionCounts[key] = (mentionCounts[key] || 0) + 1;
        }
      }

      // Get cluster counts
      const { data: clusters } = await supabase
        .from("event_clusters")
        .select("actor_tags")
        .in("status", ["active", "emerging", "ongoing"]);

      const clusterCounts: Record<string, number> = {};
      for (const c of clusters || []) {
        for (const tag of c.actor_tags || []) {
          const key = tag.toLowerCase();
          clusterCounts[key] = (clusterCounts[key] || 0) + 1;
        }
      }

      return (data || []).map(a => ({
        ...a,
        mentions: mentionCounts[a.name.toLowerCase()] || 0,
        related_clusters: clusterCounts[a.name.toLowerCase()] || 0,
      })).sort((a, b) => b.mentions - a.mentions);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Actors</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">Loading…</p>
        </div>
        <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 rounded-md" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Actors</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">{(actors || []).length} tracked entities</p>
      </div>
      <div className="space-y-2">
        {(actors || []).map((actor) => (
          <div key={actor.id} className="intel-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-mono font-bold text-muted-foreground">
                {actor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{actor.name}</h3>
                <p className="text-xs text-muted-foreground">{actor.actor_type} · {(actor.region_tags || []).join(', ') || 'Global'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-primary">{actor.mentions} mentions</span>
              <span className="text-muted-foreground">{actor.related_clusters} clusters</span>
            </div>
          </div>
        ))}
        {(actors || []).length === 0 && (
          <p className="text-sm text-muted-foreground">No actors registered. Add actors via the database.</p>
        )}
      </div>
    </div>
  );
}
