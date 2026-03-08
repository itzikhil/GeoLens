import { DEMO_ACTORS } from "@/lib/demo-data";

export default function Actors() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Actors</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">{DEMO_ACTORS.length} tracked entities</p>
      </div>
      <div className="space-y-2">
        {DEMO_ACTORS.map((actor) => (
          <div key={actor.id} className="intel-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-mono font-bold text-muted-foreground">
                {actor.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-semibold">{actor.name}</h3>
                <p className="text-xs text-muted-foreground">{actor.actor_type} · {actor.region_tags.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-primary">{actor.mentions} mentions</span>
              <span className="text-muted-foreground">{actor.related_clusters} clusters</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
