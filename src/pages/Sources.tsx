import { DEMO_SOURCES } from "@/lib/demo-data";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";

export default function Sources() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">{DEMO_SOURCES.length} registered sources</p>
      </div>
      <div className="space-y-2">
        {DEMO_SOURCES.map((source) => (
          <div key={source.id} className="intel-card flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-2 h-2 rounded-full ${source.is_active ? 'bg-signal-active' : 'bg-signal-cooled'}`} />
              <div>
                <h3 className="text-sm font-semibold">{source.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{source.source_type} · {source.language} · {source.region_tags.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ScoreIndicator label="REL" value={source.reliability_score} />
              {source.bias_label && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{source.bias_label}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
