import { DEMO_NARRATIVES } from "@/lib/demo-data";

export default function Narratives() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Narratives</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Recurring framing patterns across sources</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {DEMO_NARRATIVES.map((narrative) => (
          <div key={narrative.id} className="intel-card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{narrative.label}</h3>
              <span className="text-xs font-mono text-primary">{narrative.item_count} items</span>
            </div>
            <p className="text-xs text-muted-foreground">{narrative.description}</p>
            <div className="flex gap-1 flex-wrap">
              {narrative.source_types.map(st => (
                <span key={st} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">{st}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
