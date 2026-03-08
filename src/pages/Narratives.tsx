import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Narratives() {
  const { data: narratives, isLoading } = useQuery({
    queryKey: ["narratives-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("narratives")
        .select("id, label, description, region_tags, topic_tags")
        .order("label");
      if (error) throw error;

      // Get item counts per narrative
      const { data: links } = await supabase
        .from("item_narratives")
        .select("narrative_id");

      const counts: Record<string, number> = {};
      for (const link of links || []) {
        counts[link.narrative_id] = (counts[link.narrative_id] || 0) + 1;
      }

      return (data || []).map(n => ({
        ...n,
        item_count: counts[n.id] || 0,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Narratives</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">Loading…</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-md" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Narratives</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Recurring framing patterns across sources</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {(narratives || []).map((narrative) => (
          <div key={narrative.id} className="intel-card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{narrative.label}</h3>
              <span className="text-xs font-mono text-primary">{narrative.item_count} items</span>
            </div>
            <p className="text-xs text-muted-foreground">{narrative.description}</p>
            <div className="flex gap-1 flex-wrap">
              {(narrative.topic_tags || []).map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">{t}</span>
              ))}
              {(narrative.region_tags || []).map(r => (
                <span key={r} className="text-xs px-1.5 py-0.5 rounded bg-accent/15 text-accent font-mono">{r}</span>
              ))}
            </div>
          </div>
        ))}
        {(narratives || []).length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">No narratives defined yet.</p>
        )}
      </div>
    </div>
  );
}
