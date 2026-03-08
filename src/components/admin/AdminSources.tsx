import { DEMO_SOURCES } from "@/lib/demo-data";

export function AdminSources() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="section-header mb-0">Source Registry</h2>
        <button className="intel-badge-emerging cursor-pointer">+ Add Source</button>
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2 data-label">Status</th>
              <th className="text-left px-3 py-2 data-label">Name</th>
              <th className="text-left px-3 py-2 data-label">Type</th>
              <th className="text-left px-3 py-2 data-label">Regions</th>
              <th className="text-left px-3 py-2 data-label">Reliability</th>
              <th className="text-left px-3 py-2 data-label">Bias</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_SOURCES.map((source) => (
              <tr key={source.id} className="border-t border-border hover:bg-muted/50 cursor-pointer">
                <td className="px-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${source.is_active ? 'bg-signal-active' : 'bg-signal-cooled'}`} />
                </td>
                <td className="px-3 py-2 font-medium">{source.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{source.source_type}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{source.region_tags.join(', ')}</td>
                <td className="px-3 py-2 font-mono text-xs">{Math.round(source.reliability_score * 100)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{source.bias_label || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
