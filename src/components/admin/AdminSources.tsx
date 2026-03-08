import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SourceForm } from "./SourceForm";
import { SourceBulkImportExport } from "./SourceBulkImportExport";
import { Plus, Play, RefreshCw, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SourceFormData } from "@/lib/source-templates";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function AdminSources() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data: sources, isLoading } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (formData: SourceFormData & { id?: string }) => {
      const record: any = {
        name: formData.name.trim(),
        slug: formData.id ? undefined : slugify(formData.name),
        source_type: formData.source_type,
        is_active: formData.is_active,
        base_url: formData.base_url || null,
        rss_url: formData.rss_url || formData.podcast_feed_url || null,
        external_id: formData.external_id || formData.x_handle || formData.telegram_channel || formData.youtube_channel_id || null,
        language: formData.language,
        region_tags: formData.region_tags,
        country_tags: formData.country_tags,
        reliability_score: formData.reliability_score,
        bias_label: formData.bias_label || null,
        notes: formData.notes || null,
        ingest_method: formData.ingest_method,
        rate_limit_seconds: formData.rate_limit_seconds,
      };

      // Remove undefined fields
      Object.keys(record).forEach(k => record[k] === undefined && delete record[k]);

      if (formData.id) {
        const { error } = await supabase.from('sources').update(record).eq('id', formData.id);
        if (error) throw error;
      } else {
        record.slug = slugify(formData.name);
        const { error } = await supabase.from('sources').insert(record);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingSource ? 'Source updated' : 'Source created');
      setFormOpen(false);
      setEditingSource(null);
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
    },
    onError: (err: any) => toast.error('Save failed: ' + err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('sources').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sources'] }),
    onError: (err: any) => toast.error('Toggle failed: ' + err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Source deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-sources'] });
    },
    onError: (err: any) => toast.error('Delete failed: ' + err.message),
  });

  const testIngest = async (sourceId: string) => {
    setTestingId(sourceId);
    try {
      const { data, error } = await supabase.functions.invoke('ingest-source', {
        body: { source_id: sourceId, test_mode: true },
      });
      if (error) throw error;
      if (data.skipped) {
        toast.info(`Skipped: ${data.reason}`);
      } else {
        toast.success(`Test: ${data.items_fetched || 0} fetched, ${data.items_inserted || 0} inserted, ${data.items_skipped_duplicate || 0} dupes`);
      }
    } catch (err: any) {
      toast.error('Test failed: ' + err.message);
    }
    setTestingId(null);
  };

  const openEdit = (source: any) => {
    setEditingSource({
      id: source.id,
      slug: source.slug,
      name: source.name,
      source_type: source.source_type,
      is_active: source.is_active ?? true,
      base_url: source.base_url || '',
      rss_url: source.rss_url || '',
      external_id: source.external_id || '',
      x_handle: source.source_type === 'x' ? (source.external_id || '') : '',
      telegram_channel: source.source_type === 'telegram' ? (source.external_id || '') : '',
      youtube_channel_id: source.source_type === 'youtube' ? (source.external_id || '') : '',
      podcast_feed_url: source.source_type === 'podcast' ? (source.rss_url || '') : '',
      region_tags: source.region_tags || [],
      country_tags: source.country_tags || [],
      topic_tags: [],
      language: source.language || 'en',
      reliability_score: source.reliability_score ?? 0.5,
      bias_label: source.bias_label || '',
      notes: source.notes || '',
      ingest_method: source.ingest_method || 'rss',
      rate_limit_seconds: source.rate_limit_seconds ?? 60,
      polling_interval_minutes: 15,
    });
    setFormOpen(true);
  };

  const filtered = (sources || []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.source_type.includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="section-header mb-0">Source Registry</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBulkImportExport onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['admin-sources'] })} />
          <Button size="sm" onClick={() => { setEditingSource(null); setFormOpen(true); }}>
            <Plus className="w-3 h-3 mr-1.5" /> Add Source
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter sources…" className="pl-8 h-9 text-sm" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground font-mono py-8 text-center">Loading sources…</div>
      ) : (
        <div className="border border-border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left px-3 py-2 data-label">Active</th>
                <th className="text-left px-3 py-2 data-label">Name</th>
                <th className="text-left px-3 py-2 data-label">Type</th>
                <th className="text-left px-3 py-2 data-label">Regions</th>
                <th className="text-left px-3 py-2 data-label">Lang</th>
                <th className="text-right px-3 py-2 data-label">Rel.</th>
                <th className="text-left px-3 py-2 data-label">Bias</th>
                <th className="text-left px-3 py-2 data-label">Feed</th>
                <th className="text-center px-3 py-2 data-label">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(source => (
                <tr key={source.id} className="border-t border-border hover:bg-muted/50">
                  <td className="px-3 py-2">
                    <Switch
                      checked={source.is_active ?? false}
                      onCheckedChange={v => toggleMutation.mutate({ id: source.id, is_active: v })}
                      className="scale-75"
                    />
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{source.name}</td>
                  <td className="px-3 py-2">
                    <span className="font-mono text-xs text-muted-foreground">{source.source_type}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-0.5">
                      {(source.region_tags || []).slice(0, 2).map((r: string) => (
                        <Badge key={r} variant="outline" className="text-[10px] px-1 py-0">{r}</Badge>
                      ))}
                      {(source.region_tags || []).length > 2 && <span className="text-[10px] text-muted-foreground">+{(source.region_tags || []).length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{source.language}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{Math.round((source.reliability_score ?? 0.5) * 100)}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{source.bias_label || '—'}</td>
                  <td className="px-3 py-2">
                    {source.rss_url ? (
                      <span className="intel-badge-active text-[10px]">RSS</span>
                    ) : source.external_id ? (
                      <span className="intel-badge-emerging text-[10px]">API</span>
                    ) : (
                      <span className="intel-badge-cooled text-[10px]">NONE</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(source)} title="Edit">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled={testingId === source.id} onClick={() => testIngest(source.id)} title="Test ingest">
                        {testingId === source.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => {
                        if (confirm(`Delete source "${source.name}"? This cannot be undone.`)) deleteMutation.mutate(source.id);
                      }} title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground text-sm">
                    {search ? 'No sources match your filter.' : 'No sources yet. Click "Add Source" to create one.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) setEditingSource(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSource?.id ? 'Edit Source' : 'Add Source'}</DialogTitle>
          </DialogHeader>
          <SourceForm
            initialData={editingSource || undefined}
            onSubmit={data => upsertMutation.mutate(data)}
            onCancel={() => { setFormOpen(false); setEditingSource(null); }}
            isSubmitting={upsertMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
