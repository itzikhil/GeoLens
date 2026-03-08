import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Play, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface SourceDiagnostic {
  id: string;
  name: string;
  source_type: string;
  is_active: boolean;
  last_ingested_at: string | null;
  last_successful_ingest_at: string | null;
  rate_limit_seconds: number | null;
  latest_job?: {
    id: string;
    status: string;
    started_at: string | null;
    finished_at: string | null;
    items_fetched: number;
    items_inserted: number;
    items_skipped_duplicate: number;
    error_message: string | null;
    retry_count: number;
  } | null;
}

export function AdminDiagnostics() {
  const queryClient = useQueryClient();
  const [testingSource, setTestingSource] = useState<string | null>(null);

  const { data: diagnostics, isLoading, refetch } = useQuery({
    queryKey: ['admin-diagnostics'],
    queryFn: async () => {
      // Fetch all sources
      const { data: sources, error: srcErr } = await supabase
        .from('sources')
        .select('id, name, source_type, is_active, last_ingested_at, last_successful_ingest_at, rate_limit_seconds')
        .order('name');

      if (srcErr) throw srcErr;

      // Fetch latest job for each source
      const results: SourceDiagnostic[] = [];
      for (const source of sources || []) {
        const { data: jobs } = await supabase
          .from('ingestion_jobs')
          .select('id, status, started_at, finished_at, items_fetched, items_inserted, items_skipped_duplicate, error_message, retry_count')
          .eq('source_id', source.id)
          .order('created_at', { ascending: false })
          .limit(1);

        results.push({
          ...source,
          latest_job: jobs && jobs.length > 0 ? jobs[0] : null,
        });
      }

      return results;
    },
  });

  const testSourceMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      setTestingSource(sourceId);
      const { data, error } = await supabase.functions.invoke('ingest-source', {
        body: { source_id: sourceId, test_mode: true },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Test complete: ${data.items_fetched} fetched, ${data.items_inserted} inserted`);
      setTestingSource(null);
      queryClient.invalidateQueries({ queryKey: ['admin-diagnostics'] });
    },
    onError: (err: any) => {
      toast.error(`Test failed: ${err.message}`);
      setTestingSource(null);
    },
  });

  const statusIcon = (status: string | undefined) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-[hsl(var(--signal-active))]" />;
      case 'partial_success': return <AlertCircle className="w-4 h-4 text-[hsl(var(--signal-emerging))]" />;
      case 'running': return <RefreshCw className="w-4 h-4 text-[hsl(var(--accent))] animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'queued': return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <span className="w-4 h-4 rounded-full bg-muted inline-block" />;
    }
  };

  const formatTime = (ts: string | null) => {
    if (!ts) return '—';
    const d = new Date(ts);
    const now = Date.now();
    const diffMin = Math.round((now - d.getTime()) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.round(diffMin / 60)}h ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm font-mono p-4">Loading diagnostics…</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="section-header mb-0">Source Diagnostics</h2>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3 mr-1.5" /> Refresh
        </Button>
      </div>

      <div className="border border-border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-3 py-2 data-label">Status</th>
              <th className="text-left px-3 py-2 data-label">Source</th>
              <th className="text-left px-3 py-2 data-label">Type</th>
              <th className="text-left px-3 py-2 data-label">Last Attempt</th>
              <th className="text-left px-3 py-2 data-label">Last Success</th>
              <th className="text-right px-3 py-2 data-label">Fetched</th>
              <th className="text-right px-3 py-2 data-label">Inserted</th>
              <th className="text-right px-3 py-2 data-label">Dupes</th>
              <th className="text-right px-3 py-2 data-label">Retries</th>
              <th className="text-left px-3 py-2 data-label">Error</th>
              <th className="text-center px-3 py-2 data-label">Action</th>
            </tr>
          </thead>
          <tbody>
            {(diagnostics || []).map((d) => (
              <tr key={d.id} className="border-t border-border hover:bg-muted/50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    {statusIcon(d.latest_job?.status)}
                    {!d.is_active && <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1 rounded">OFF</span>}
                  </div>
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">{d.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{d.source_type}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(d.latest_job?.started_at || d.last_ingested_at)}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {formatTime(d.last_successful_ingest_at)}
                </td>
                <td className="px-3 py-2 font-mono text-xs text-right">{d.latest_job?.items_fetched ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-xs text-right">{d.latest_job?.items_inserted ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-xs text-right">{d.latest_job?.items_skipped_duplicate ?? '—'}</td>
                <td className="px-3 py-2 font-mono text-xs text-right">{d.latest_job?.retry_count ?? '—'}</td>
                <td className="px-3 py-2 text-xs text-destructive max-w-[200px] truncate" title={d.latest_job?.error_message || ''}>
                  {d.latest_job?.error_message ? d.latest_job.error_message.substring(0, 80) : '—'}
                </td>
                <td className="px-3 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    disabled={testingSource === d.id}
                    onClick={() => testSourceMutation.mutate(d.id)}
                  >
                    {testingSource === d.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
            {(!diagnostics || diagnostics.length === 0) && (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-muted-foreground text-sm">
                  No sources found in the database. Add sources via the Sources tab to begin ingestion.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="intel-card space-y-2">
        <h3 className="text-sm font-semibold">Handler Implementation Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[hsl(var(--signal-active))]" />
            <span className="font-mono">RSS / Mainstream / Niche / Think Tank / Gov</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-[hsl(var(--signal-emerging))]" />
            <span className="font-mono">Podcast RSS · Manual URL</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono">News API · YouTube</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono">X/Twitter · Telegram</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          ✅ Fully implemented &nbsp;·&nbsp; ⚠️ Partially implemented &nbsp;·&nbsp; 🔲 Placeholder (requires API key)
        </p>
      </div>
    </div>
  );
}
