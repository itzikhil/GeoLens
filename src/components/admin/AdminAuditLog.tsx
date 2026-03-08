import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, User, Clock } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  retry_job: { label: 'Retry Job', color: 'text-[hsl(var(--signal-emerging))]' },
  manual_enrich: { label: 'Manual Enrich', color: 'text-primary' },
  manual_recluster: { label: 'Recluster', color: 'text-accent' },
  generate_daily_brief: { label: 'Generate Brief', color: 'text-[hsl(var(--chart-4))]' },
  update_setting: { label: 'Update Setting', color: 'text-[hsl(var(--signal-emerging))]' },
  delete_analyst_note: { label: 'Delete Note', color: 'text-destructive' },
  merge_clusters: { label: 'Merge Clusters', color: 'text-accent' },
  split_cluster: { label: 'Split Cluster', color: 'text-accent' },
  toggle_source: { label: 'Toggle Source', color: 'text-muted-foreground' },
  test_source: { label: 'Test Source', color: 'text-primary' },
};

export function AdminAuditLog() {
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as Array<{
        id: string;
        user_id: string;
        action: string;
        entity_type: string;
        entity_id: string | null;
        details: any;
        created_at: string;
      }>;
    },
  });

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="section-header mb-0">Audit Log</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-3 h-3 mr-1" /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm font-mono p-4">Loading audit log…</div>
      ) : (logs || []).length === 0 ? (
        <div className="intel-card text-center py-8">
          <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No admin actions recorded yet</p>
        </div>
      ) : (
        <div className="border border-border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-3 py-2 data-label">Time</th>
                <th className="text-left px-3 py-2 data-label">Action</th>
                <th className="text-left px-3 py-2 data-label">Entity</th>
                <th className="text-left px-3 py-2 data-label">Details</th>
                <th className="text-left px-3 py-2 data-label">User</th>
              </tr>
            </thead>
            <tbody>
              {logs!.map(log => {
                const actionMeta = ACTION_LABELS[log.action] || { label: log.action, color: 'text-foreground' };
                return (
                  <tr key={log.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">{formatTime(log.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-mono font-medium ${actionMeta.color}`}>{actionMeta.label}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <span className="text-xs font-mono text-muted-foreground">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="text-[10px] font-mono text-muted-foreground ml-1 truncate max-w-[120px] inline-block align-bottom">
                            {log.entity_id.substring(0, 12)}…
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 max-w-[250px]">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <span className="text-xs text-muted-foreground truncate block">
                          {JSON.stringify(log.details).substring(0, 80)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-[10px] text-muted-foreground">{log.user_id.substring(0, 8)}…</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
