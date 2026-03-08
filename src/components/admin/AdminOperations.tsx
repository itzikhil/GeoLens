import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, FileText, Layers, MessageSquare, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function AdminOperations() {
  const queryClient = useQueryClient();
  const [enriching, setEnriching] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [reclustering, setReclustering] = useState(false);

  // Pending items (not yet enriched)
  const { data: pendingItems } = useQuery({
    queryKey: ['pending-enrich'],
    queryFn: async () => {
      const { count } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('ingestion_status', 'pending');
      return count || 0;
    },
  });

  // Analyst notes for moderation
  const { data: notes, refetch: refetchNotes } = useQuery({
    queryKey: ['analyst-notes-moderation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyst_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Items needing reclustering (completed enrichment but no cluster)
  const { data: unclusteredCount } = useQuery({
    queryKey: ['unclustered-items'],
    queryFn: async () => {
      const { data: enrichedItems } = await supabase
        .from('items')
        .select('id')
        .eq('ingestion_status', 'completed')
        .limit(500);
      
      if (!enrichedItems || enrichedItems.length === 0) return 0;

      const { data: clusteredItemIds } = await supabase
        .from('event_cluster_items')
        .select('item_id');

      const clusteredSet = new Set((clusteredItemIds || []).map(ci => ci.item_id));
      return enrichedItems.filter(i => !clusteredSet.has(i.id)).length;
    },
  });

  const logAudit = async (action: string, entityType: string, details: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('admin_audit_log' as any).insert({
        user_id: user.id,
        action,
        entity_type: entityType,
        details,
      });
    }
  };

  const enrichMutation = useMutation({
    mutationFn: async () => {
      setEnriching(true);
      const { data, error } = await supabase.functions.invoke('enrich-item', {
        body: { batch_mode: true },
      });
      if (error) throw error;
      await logAudit('manual_enrich', 'items', { batch_mode: true });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Enrichment complete: ${data?.processed || 0} items processed`);
      setEnriching(false);
      queryClient.invalidateQueries({ queryKey: ['pending-enrich'] });
    },
    onError: (err: any) => {
      toast.error(`Enrichment failed: ${err.message}`);
      setEnriching(false);
    },
  });

  const briefMutation = useMutation({
    mutationFn: async () => {
      setGeneratingBrief(true);
      const { data, error } = await supabase.functions.invoke('generate-daily-brief', {
        body: { manual: true },
      });
      if (error) throw error;
      await logAudit('generate_daily_brief', 'brief', { manual: true });
      return data;
    },
    onSuccess: (data) => {
      toast.success('Daily brief generated successfully');
      setGeneratingBrief(false);
    },
    onError: (err: any) => {
      toast.error(`Brief generation failed: ${err.message}`);
      setGeneratingBrief(false);
    },
  });

  const reclusterMutation = useMutation({
    mutationFn: async () => {
      setReclustering(true);
      const { data, error } = await supabase.functions.invoke('enrich-item', {
        body: { recluster_only: true },
      });
      if (error) throw error;
      await logAudit('manual_recluster', 'clusters', {});
      return data;
    },
    onSuccess: () => {
      toast.success('Reclustering triggered');
      setReclustering(false);
      queryClient.invalidateQueries({ queryKey: ['unclustered-items'] });
    },
    onError: (err: any) => {
      toast.error(`Reclustering failed: ${err.message}`);
      setReclustering(false);
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from('analyst_notes').delete().eq('id', noteId);
      if (error) throw error;
      await logAudit('delete_analyst_note', 'analyst_note', { note_id: noteId });
    },
    onSuccess: () => {
      toast.success('Note deleted');
      refetchNotes();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Enrich */}
        <div className="intel-card space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI Enrichment</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Run entity extraction, sentiment analysis, and scoring on pending items.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono">
              <span className="text-primary font-bold">{pendingItems || 0}</span> items pending
            </span>
            <Button size="sm" onClick={() => enrichMutation.mutate()} disabled={enriching || !pendingItems}>
              {enriching ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
              Enrich Now
            </Button>
          </div>
        </div>

        {/* Recluster */}
        <div className="intel-card space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold">Reclustering</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Re-run clustering logic on enriched items that aren't assigned to a cluster.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono">
              <span className="text-accent font-bold">{unclusteredCount || 0}</span> unclustered
            </span>
            <Button size="sm" variant="outline" onClick={() => reclusterMutation.mutate()} disabled={reclustering}>
              {reclustering ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Layers className="w-3 h-3 mr-1" />}
              Recluster
            </Button>
          </div>
        </div>

        {/* Daily Brief */}
        <div className="intel-card space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[hsl(var(--chart-4))]" />
            <h3 className="text-sm font-semibold">Daily Brief</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Generate a summary brief of today's most significant developments across all regions.
          </p>
          <div className="flex items-center justify-end">
            <Button size="sm" variant="outline" onClick={() => briefMutation.mutate()} disabled={generatingBrief}>
              {generatingBrief ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
              Generate Brief
            </Button>
          </div>
        </div>
      </div>

      {/* Analyst Notes Moderation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h2 className="section-header mb-0">Analyst Notes ({(notes || []).length})</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchNotes()}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>

        {(notes || []).length === 0 ? (
          <div className="intel-card text-center py-8">
            <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No analyst notes to moderate</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(notes || []).map(note => (
              <div key={note.id} className="intel-card py-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{note.title}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(note.created_at!).toLocaleDateString()}
                    </span>
                  </div>
                  {note.body && <p className="text-xs text-muted-foreground line-clamp-2">{note.body}</p>}
                  <div className="flex gap-2 mt-1">
                    {note.event_cluster_id && <span className="text-[10px] font-mono text-accent">cluster linked</span>}
                    {note.actor_id && <span className="text-[10px] font-mono text-primary">actor linked</span>}
                    {note.item_id && <span className="text-[10px] font-mono text-muted-foreground">item linked</span>}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive shrink-0"
                  onClick={() => deleteNoteMutation.mutate(note.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
