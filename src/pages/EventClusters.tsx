import { DEMO_CLUSTERS } from "@/lib/demo-data";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { TagList } from "@/components/shared/TagList";

export default function EventClusters() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Event Clusters</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">{DEMO_CLUSTERS.length} tracked clusters</p>
      </div>
      <div className="space-y-3">
        {DEMO_CLUSTERS.map((cluster) => (
          <div key={cluster.id} className="intel-card space-y-3">
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
