import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TagList } from "@/components/shared/TagList";
import { DEMO_CLUSTERS, DEMO_REGIONS, DEMO_ACTORS } from "@/lib/demo-data";

export default function Overview() {
  const topClusters = DEMO_CLUSTERS.filter(c => c.status === 'active' || c.status === 'emerging').slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Intelligence Overview</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* What Matters Today */}
      <div className="intel-card border-primary/30">
        <h2 className="data-label mb-2">What Matters Today</h2>
        <p className="text-sm leading-relaxed">
          Heightened naval activity in the South China Sea coincides with new EU sanctions package discussions.
          Energy markets show volatility amid OPEC+ uncertainty. Horn of Africa humanitarian corridor negotiations
          stall as regional actors recalibrate positions.
        </p>
      </div>

      {/* Top Event Clusters */}
      <div>
        <h2 className="section-header">Active Event Clusters</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {topClusters.map((cluster) => (
            <div key={cluster.id} className="intel-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight">{cluster.title}</h3>
                <StatusBadge status={cluster.status} />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{cluster.description}</p>
              <div className="flex items-center gap-3">
                <ScoreIndicator label="SIG" value={cluster.significance_score} />
                <ScoreIndicator label="CON" value={cluster.confidence_score} />
              </div>
              <TagList tags={cluster.region_tags} variant="region" />
            </div>
          ))}
        </div>
      </div>

      {/* Regions Overview */}
      <div>
        <h2 className="section-header">Regional Activity</h2>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {DEMO_REGIONS.map((region) => (
            <div key={region.name} className="intel-card py-3 flex items-center justify-between">
              <span className="text-xs font-medium">{region.name}</span>
              <span className="text-xs font-mono text-muted-foreground">{region.activeEvents} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Actors */}
      <div>
        <h2 className="section-header">Key Actors</h2>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {DEMO_ACTORS.slice(0, 6).map((actor) => (
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
    </div>
  );
}
