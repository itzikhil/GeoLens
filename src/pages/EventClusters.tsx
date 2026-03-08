import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { TagList } from "@/components/shared/TagList";
import { useNavigate } from "react-router-dom";
import { DEMO_CLUSTERS } from "@/lib/demo-data";

export default function EventClusters() {
  const navigate = useNavigate();

  const { data: dbClusters, isLoading } = useQuery({
    queryKey: ['event-clusters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_clusters')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Use DB clusters if available, fall back to demo data
  const clusters = dbClusters && dbClusters.length > 0
    ? dbClusters.map(c => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description || '',
        status: c.status || 'emerging',
        region_tags: c.region_tags || [],
        country_tags: c.country_tags || [],
        topic_tags: c.topic_tags || [],
        actor_tags: c.actor_tags || [],
        significance_score: c.significance_score || 0,
        confidence_score: c.confidence_score || 0,
        item_count: (c as any).item_count || 0,
        source_diversity: (c as any).source_diversity_count || 0,
      }))
    : DEMO_CLUSTERS;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Event Clusters</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {isLoading ? 'Loading…' : `${clusters.length} tracked clusters`}
        </p>
      </div>
      <div className="space-y-3">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="intel-card space-y-3 cursor-pointer"
            onClick={() => navigate(`/clusters/${cluster.slug}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={cluster.status} />
                  <span className="text-xs text-muted-foreground font-mono">{cluster.item_count} items</span>
                  <span className="text-xs text-muted-foreground font-mono">{cluster.source_diversity} sources</span>
                </div>
                <h3 className="font-semibold">{cluster.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
              </div>
              <div className="flex flex-col gap-1.5 items-end shrink-0">
                <ScoreIndicator label="SIG" value={cluster.significance_score} />
                <ScoreIndicator label="CON" value={cluster.confidence_score} />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <TagList tags={cluster.region_tags} variant="region" />
              <TagList tags={cluster.topic_tags} variant="topic" />
              <TagList tags={cluster.actor_tags} variant="actor" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
