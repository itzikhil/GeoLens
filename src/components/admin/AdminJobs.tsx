import { DEMO_JOBS } from "@/lib/demo-data";

const statusColors: Record<string, string> = {
  completed: 'intel-badge-active',
  running: 'intel-badge-emerging',
  failed: 'intel-badge-critical',
  queued: 'intel-badge-cooled',
};

export function AdminJobs() {
  return (
    <div className="space-y-3">
      <h2 className="section-header">Ingestion Jobs</h2>
      <div className="border border-border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2 data-label">Status</th>
              <th className="text-left px-3 py-2 data-label">Source</th>
              <th className="text-left px-3 py-2 data-label">Type</th>
              <th className="text-left px-3 py-2 data-label">Items</th>
              <th className="text-left px-3 py-2 data-label">Errors</th>
              <th className="text-left px-3 py-2 data-label">Started</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_JOBS.map((job) => (
              <tr key={job.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <span className={statusColors[job.status]}>{job.status.toUpperCase()}</span>
                </td>
                <td className="px-3 py-2 font-medium">{job.source_name}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{job.job_type}</td>
                <td className="px-3 py-2 font-mono text-xs">{job.items_processed}</td>
                <td className="px-3 py-2 font-mono text-xs">{job.errors > 0 ? <span className="text-destructive">{job.errors}</span> : '0'}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground font-mono">{job.started_at ? new Date(job.started_at).toLocaleTimeString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
