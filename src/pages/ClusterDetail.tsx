import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ScoreIndicator } from "@/components/shared/ScoreIndicator";
import { TagList } from "@/components/shared/TagList";
import { ArrowLeft, RefreshCw, Trash2, Pin, Merge, Scissors, Sparkles } from "lucide-react";
import { SourceComparisonPanel } from "@/components/shared/SourceComparisonPanel";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClusterDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mergeOpen, setMergeOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const { data: cluster, isLoading } = useQuery({
    queryKey: ['cluster-detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_clusters')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: clusterItems } = useQuery({
    queryKey: ['cluster-items', cluster?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_cluster_items')
        .select('*, items(id, title, summary_short, source_type, published_at, author, actor_tags, country_tags, topic_tags, credibility_score, importance_score, url, stance_label, sentiment_label)')
        .eq('event_cluster_id', cluster!.id)
        .order('relevance_score', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!cluster?.id,
  });

  const { data: otherClusters } = useQuery({
    queryKey: ['other-clusters', cluster?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('event_clusters')
        .select('id, title, status')
        .neq('id', cluster!.id)
        .in('status', ['emerging', 'active', 'ongoing'])
        .order('updated_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!cluster?.id,
  });

  const adminAction = useMutation({
    mutationFn: async (body: any) => {
      const { data, error } = await supabase.functions.invoke('cluster-admin', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Action completed');
      queryClient.invalidateQueries({ queryKey: ['cluster-detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['cluster-items'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  if (isLoading) return <div className="text-muted-foreground font-mono p-8">Loading cluster…</div>;
  if (!cluster) return <div className="text-muted-foreground font-mono p-8">Cluster not found</div>;

  const narrativeComparison = (cluster as any).narrative_comparison as Array<{ source_type: string; framing: string }> | null;
  const groupingRationale = (cluster as any).grouping_rationale as string | null;

  // Group items by source_type for narrative comparison
  const itemsBySourceType: Record<string, any[]> = {};
  for (const ci of clusterItems || []) {
    const item = ci.items as any;
    if (!item) continue;
    const st = item.source_type || 'unknown';
    if (!itemsBySourceType[st]) itemsBySourceType[st] = [];
    itemsBySourceType[st].push(item);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/clusters')} className="mb-2">
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to clusters
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={cluster.status || 'emerging'} />
              <span className="font-mono text-xs text-muted-foreground">{(cluster as any).item_count || 0} items</span>
              <span className="font-mono text-xs text-muted-foreground">{(cluster as any).source_diversity_count || 0} sources</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{cluster.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{cluster.description}</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            <ScoreIndicator label="SIG" value={cluster.significance_score || 0} />
            <ScoreIndicator label="CON" value={cluster.confidence_score || 0} />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap mt-3">
          <TagList tags={cluster.region_tags || []} variant="region" />
          <TagList tags={cluster.topic_tags || []} variant="topic" />
          <TagList tags={cluster.actor_tags || []} variant="actor" />
        </div>
      </div>

      {/* Admin Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => adminAction.mutate({ action: 'regenerate_summary', cluster_id: cluster.id })} disabled={adminAction.isPending}>
          <Sparkles className="w-3 h-3 mr-1.5" /> Regenerate Summary
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMergeOpen(true)}>
          <Merge className="w-3 h-3 mr-1.5" /> Merge Into…
        </Button>
        {selectedItems.size > 0 && (
          <Button variant="outline" size="sm" onClick={() => {
            adminAction.mutate({ action: 'split', cluster_id: cluster.id, item_ids: [...selectedItems] });
            setSelectedItems(new Set());
          }}>
            <Scissors className="w-3 h-3 mr-1.5" /> Split {selectedItems.size} Selected
          </Button>
        )}
      </div>

      {/* Grouping Rationale */}
      {groupingRationale && (
        <div className="intel-card space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Why These Items Are Grouped
          </h2>
          <p className="text-sm text-muted-foreground">{groupingRationale}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            <div>
              <p className="data-label mb-1">Connecting Actors</p>
              <div className="flex flex-wrap gap-1">
                {((cluster as any).top_actors || cluster.actor_tags || []).slice(0, 8).map((a: string) => (
                  <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="data-label mb-1">Connecting Countries</p>
              <div className="flex flex-wrap gap-1">
                {((cluster as any).top_countries || cluster.country_tags || []).slice(0, 8).map((c: string) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="data-label mb-1">Connecting Topics</p>
              <div className="flex flex-wrap gap-1">
                {((cluster as any).top_topics || cluster.topic_tags || []).slice(0, 8).map((t: string) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Narrative Comparison */}
      {narrativeComparison && narrativeComparison.length > 0 && (
        <div className="intel-card space-y-3">
          <h2 className="text-sm font-semibold">Same Story, Different Narrative</h2>
          <div className="space-y-2">
            {narrativeComparison.map((nc, i) => (
              <div key={i} className="flex gap-3 items-start py-1.5 border-b border-border last:border-0">
                <span className="intel-badge-emerging shrink-0">{nc.source_type}</span>
                <p className="text-sm text-muted-foreground">{nc.framing}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Comparison Panel */}
      {(clusterItems || []).length > 0 && (
        <div className="intel-card space-y-3">
          <h2 className="text-sm font-semibold">Source Comparison</h2>
          <SourceComparisonPanel
            items={(clusterItems || [])
              .filter((ci: any) => ci.items)
              .map((ci: any) => ({
                id: ci.items.id,
                title: ci.items.title,
                source_type: ci.items.source_type || 'unknown',
                summary_short: ci.items.summary_short,
                stance_label: (ci.items as any).stance_label || null,
                sentiment_label: (ci.items as any).sentiment_label || null,
                credibility_score: ci.items.credibility_score,
                importance_score: ci.items.importance_score,
                url: ci.items.url,
                author: ci.items.author,
                published_at: ci.items.published_at,
              }))}
            clusterTitle={cluster.title}
          />
        </div>
      )}

      {/* Timeline */}
      <div className="intel-card space-y-3">
        <h2 className="text-sm font-semibold">Timeline</h2>
        <div className="space-y-0">
          {(clusterItems || [])
            .filter((ci: any) => ci.items?.published_at)
            .sort((a: any, b: any) => new Date(b.items.published_at).getTime() - new Date(a.items.published_at).getTime())
            .map((ci: any) => {
              const item = ci.items;
              return (
                <div key={ci.id} className="flex gap-3 py-2 border-b border-border last:border-0 group">
                  <div className="flex flex-col items-center shrink-0 w-20">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(item.published_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(item.published_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="w-px bg-border shrink-0 relative">
                    <div className="absolute top-2 -left-[3px] w-[7px] h-[7px] rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.summary_short || ''}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{item.source_type}</span>
                      {item.importance_score && <ScoreIndicator label="IMP" value={item.importance_score} />}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* All Items with admin actions */}
      <div className="intel-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Cluster Items ({(clusterItems || []).length})</h2>
          {selectedItems.size > 0 && (
            <span className="text-xs text-primary font-mono">{selectedItems.size} selected</span>
          )}
        </div>
        <div className="space-y-1">
          {(clusterItems || []).map((ci: any) => {
            const item = ci.items;
            if (!item) return null;
            const isSelected = selectedItems.has(item.id);
            return (
              <div key={ci.id} className={`flex items-center gap-2 py-2 px-2 rounded border ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'}`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggleItem(item.id)} className="shrink-0 accent-[hsl(var(--primary))]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{item.source_type}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.published_at?.substring(0, 10)}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">rel:{Math.round((ci.relevance_score || 0) * 100)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Pin to cluster"
                    onClick={() => adminAction.mutate({ action: 'pin_item', cluster_id: cluster.id, item_id: item.id })}>
                    <Pin className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" title="Remove from cluster"
                    onClick={() => adminAction.mutate({ action: 'remove_item', cluster_id: cluster.id, item_id: item.id })}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Merge Dialog */}
      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge "{cluster.title}" into another cluster</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">All items from this cluster will be moved to the target. This cluster will be archived.</p>
          <Select value={mergeTarget} onValueChange={setMergeTarget}>
            <SelectTrigger><SelectValue placeholder="Select target cluster" /></SelectTrigger>
            <SelectContent>
              {(otherClusters || []).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.title} ({c.status})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setMergeOpen(false)}>Cancel</Button>
            <Button disabled={!mergeTarget} onClick={() => {
              adminAction.mutate({ action: 'merge', cluster_id: cluster.id, target_cluster_id: mergeTarget });
              setMergeOpen(false);
            }}>Merge</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
