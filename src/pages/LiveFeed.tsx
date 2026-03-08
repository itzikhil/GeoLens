import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ItemCard } from "@/components/shared/ItemCard";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SOURCE_FILTERS = ["All", "mainstream", "think_tank", "government", "youtube", "telegram", "x", "podcast", "rss"] as const;

export default function LiveFeed() {
  const [filter, setFilter] = useState<string>("All");

  const { data: items, isLoading } = useQuery({
    queryKey: ["live-feed", filter],
    queryFn: async () => {
      let query = supabase
        .from("items")
        .select("id, title, summary_short, published_at, source_type, source_id, importance_score, credibility_score, region_tags, topic_tags, actor_tags, url, sources(name)")
        .order("published_at", { ascending: false })
        .limit(50);

      if (filter !== "All") {
        query = query.eq("source_type", filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ["live-feed-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("items").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Feed</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {totalCount ?? '—'} items — all sources
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SOURCE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`intel-badge cursor-pointer transition-colors ${f === filter ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
          >
            {f === "All" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 rounded-md" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {(items || []).map((item) => (
            <ItemCard
              key={item.id}
              item={{
                id: item.id,
                title: item.title,
                source_name: (item.sources as any)?.name || item.source_type || 'Unknown',
                source_type: item.source_type || 'unknown',
                media_type: 'article',
                published_at: item.published_at || new Date().toISOString(),
                region_tags: item.region_tags || [],
                topic_tags: item.topic_tags || [],
                actor_tags: item.actor_tags || [],
                credibility_score: item.credibility_score || 0,
                importance_score: item.importance_score || 0,
                summary_short: item.summary_short || '',
              }}
            />
          ))}
          {(items || []).length === 0 && (
            <div className="intel-card py-8 text-center text-muted-foreground text-sm">
              No items found{filter !== "All" ? ` for filter "${filter}"` : ""}. Run ingestion from Admin → Operations.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
