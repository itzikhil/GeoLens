import { DEMO_REGIONS } from "@/lib/demo-data";

export default function Regions() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Regions</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Global coverage across {DEMO_REGIONS.length} regions</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_REGIONS.map((region) => (
          <div key={region.name} className="intel-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{region.name}</h3>
              <span className="intel-badge-active">{region.activeEvents} active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-mono font-bold">{region.totalItems}</p>
                <p className="data-label">Items</p>
              </div>
              <div>
                <p className="text-lg font-mono font-bold">{region.actors}</p>
                <p className="data-label">Actors</p>
              </div>
              <div>
                <p className="text-lg font-mono font-bold">{region.sources}</p>
                <p className="data-label">Sources</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {region.topTopics.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
