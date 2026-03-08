import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw, AlertTriangle, CheckCircle2, Clock, XCircle, Play, Filter } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<string, string> = {
  completed: 'intel-badge-active',
  partial_success: 'intel-badge-emerging',
  running: 'intel-badge-emerging',
  failed: 'intel-badge-critical',
  queued: 'intel-badge-cooled',
  cancelled: 'intel-badge-cooled',
};

export function AdminJobs() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [retryingJob, setRetryingJob] = useState<string | null>(null);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['admin-jobs', filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('ingestion_jobs')
        .select('*, sources(name, source_type)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as any);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const retryMutation = useMutation({
    mutationFn: async (job: any) => {
      setRetryingJob(job.id);
      const { data, error } = await supabase.functions.invoke('ingest-source', {
        body: { source_id: job.source_id, test_mode: false },
      });
      if (error) throw error;
      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from('admin_audit_log').insert({
          user_id: user.id,
          action: 'retry_job',
          entity_type: 'ingestion_job',
          entity_id: job.id,
          details: { source_id: job.source_id },
        });
      }
      return data;
    },
    onSuccess: () => {
      toast.success('Job retried successfully');
      setRetryingJob(null);
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] });
    },
    onError: (err: any) => {
      toast.error(`Retry failed: ${err.message}`);
      setRetryingJob(null);
    },
  });

  const failedJobs = (jobs || []).filter(j => j.status === 'failed');
  const runningJobs = (jobs || []).filter(j => j.status === 'running' || j.status === 'queued');

  const formatTime = (ts: string | null) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start: string | null, end: string | null) => {
    if (!start) return '—';
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const secs = Math.round((e - s) / 1000);
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="intel-card py-3 text-center">
          <p className="text-xl font-mono font-bold">{(jobs || []).length}</p>
          <p className="data-label">Total Jobs</p>
        </div>
        <div className="intel-card py-3 text-center">
          <p className="text-xl font-mono font-bold text-[hsl(var(--signal-active))]">{runningJobs.length}</p>
          <p className="data-label">In Progress</p>
        </div>
        <div className="intel-card py-3 text-center">
          <p className="text-xl font-mono font-bold text-destructive">{failedJobs.length}</p>
          <p className="data-label">Failed</p>
        </div>
        <div className="intel-card py-3 text-center">
          <p className="text-xl font-mono font-bold">
            {(jobs || []).reduce((sum, j) => sum + (j.items_inserted || 0), 0)}
          </p>
          <p className="data-label">Items Inserted</p>
        </div>
      </div>

      {/* Failed Jobs Queue */}
      {failedJobs.length > 0 && filterStatus === 'all' && (
        <div className="intel-card border-destructive/30 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold">Failed Jobs Queue ({failedJobs.length})</h3>
          </div>
          <div className="space-y-2">
            {failedJobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{(job as any).sources?.name || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{job.job_type}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{formatTime(job.started_at)}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">retries: {job.retry_count || 0}/{job.max_retries || 3}</span>
                  </div>
                  {job.error_message && (
                    <p className="text-xs text-destructive mt-0.5 truncate max-w-md">{job.error_message}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={retryingJob === job.id}
                  onClick={() => retryMutation.mutate(job)}
                >
                  {retryingJob === job.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                  Retry
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-header mb-0">All Ingestion Jobs</h2>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="partial_success">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-3 py-2 data-label">Status</th>
                <th className="text-left px-3 py-2 data-label">Source</th>
                <th className="text-left px-3 py-2 data-label">Type</th>
                <th className="text-right px-3 py-2 data-label">Fetched</th>
                <th className="text-right px-3 py-2 data-label">Inserted</th>
                <th className="text-right px-3 py-2 data-label">Dupes</th>
                <th className="text-left px-3 py-2 data-label">Duration</th>
                <th className="text-left px-3 py-2 data-label">Started</th>
                <th className="text-left px-3 py-2 data-label">Error</th>
                <th className="text-center px-3 py-2 data-label">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground text-sm font-mono">Loading…</td></tr>
              ) : (jobs || []).length === 0 ? (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground text-sm">No jobs found</td></tr>
              ) : (jobs || []).map(job => (
                <tr key={job.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-3 py-2">
                    <span className={statusColors[job.status || 'queued']}>{(job.status || 'queued').toUpperCase()}</span>
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{(job as any).sources?.name || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{job.job_type}</td>
                  <td className="px-3 py-2 font-mono text-xs text-right">{job.items_fetched ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-xs text-right">{job.items_inserted ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-xs text-right">{job.items_skipped_duplicate ?? 0}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{getDuration(job.started_at, job.finished_at)}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{formatTime(job.started_at)}</td>
                  <td className="px-3 py-2 text-xs text-destructive max-w-[200px] truncate" title={job.error_message || ''}>
                    {job.error_message ? job.error_message.substring(0, 60) : '—'}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {job.status === 'failed' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2" disabled={retryingJob === job.id}
                        onClick={() => retryMutation.mutate(job)}>
                        <RotateCcw className="w-3 h-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
