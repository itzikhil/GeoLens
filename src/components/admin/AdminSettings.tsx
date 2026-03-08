import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface SettingRow {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string | null;
}

const SETTING_LABELS: Record<string, { label: string; help: string }> = {
  enrichment_prompt: { label: 'Enrichment Prompt Template', help: 'System prompt and field list for AI enrichment of ingested items.' },
  clustering_rules: { label: 'Clustering Weights & Thresholds', help: 'Scoring weights for actor/time/country/topic/region overlap and minimum threshold.' },
  scoring_rules: { label: 'Credibility & Importance Scoring', help: 'Factors and defaults for computing item credibility and importance scores.' },
  daily_brief_prompt: { label: 'Daily Brief Prompt', help: 'System prompt and configuration for automated daily intelligence brief generation.' },
  ingestion_defaults: { label: 'Ingestion Pipeline Defaults', help: 'Default polling intervals, retry limits, and deduplication threshold.' },
};

export function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings' as any)
        .select('*')
        .order('key');
      if (error) throw error;
      return (data || []) as SettingRow[];
    },
  });

  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (settings) {
      const initial: Record<string, string> = {};
      for (const s of settings) {
        initial[s.key] = JSON.stringify(s.value, null, 2);
      }
      setEditedValues(initial);
      setDirtyKeys(new Set());
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (key: string) => {
      const parsed = JSON.parse(editedValues[key]);
      const { error } = await supabase
        .from('system_settings' as any)
        .update({ value: parsed, updated_at: new Date().toISOString() })
        .eq('key', key);
      if (error) throw error;

      // Audit log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('admin_audit_log' as any).insert({
          user_id: user.id,
          action: 'update_setting',
          entity_type: 'system_setting',
          entity_id: key,
          details: { new_value: parsed },
        });
      }
    },
    onSuccess: (_, key) => {
      toast.success(`${SETTING_LABELS[key]?.label || key} saved`);
      setDirtyKeys(prev => { const n = new Set(prev); n.delete(key); return n; });
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (err: any) => toast.error(`Save failed: ${err.message}`),
  });

  const handleChange = (key: string, val: string) => {
    setEditedValues(prev => ({ ...prev, [key]: val }));
    setDirtyKeys(prev => new Set(prev).add(key));
  };

  const isValidJson = (str: string) => {
    try { JSON.parse(str); return true; } catch { return false; }
  };

  if (isLoading) return <div className="text-muted-foreground text-sm font-mono p-4">Loading settings…</div>;

  // Split into credential settings and configurable settings
  const configSettings = (settings || []).filter(s => SETTING_LABELS[s.key]);

  return (
    <div className="space-y-6">
      {/* API Keys section */}
      <div className="intel-card space-y-3">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">API Keys & Credentials</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          External API keys are managed securely via Lovable Cloud secrets. Configure them in your project's backend settings.
        </p>
        <div className="space-y-1.5">
          {[
            { label: 'News API Key', configured: false },
            { label: 'YouTube Data API Key', configured: false },
            { label: 'X/Twitter Bearer Token', configured: false },
            { label: 'Telegram Bot Token', configured: false },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <span className="text-sm">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground">Cloud Secret</span>
                <div className={`w-2 h-2 rounded-full ${item.configured ? 'bg-[hsl(var(--signal-active))]' : 'bg-[hsl(var(--signal-cooled))]'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable settings */}
      {configSettings.map(setting => {
        const meta = SETTING_LABELS[setting.key];
        const isDirty = dirtyKeys.has(setting.key);
        const valid = isValidJson(editedValues[setting.key] || '{}');

        return (
          <div key={setting.key} className="intel-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold">{meta?.label || setting.key}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{meta?.help || setting.description}</p>
              </div>
              <Button
                size="sm"
                variant={isDirty ? 'default' : 'outline'}
                disabled={!isDirty || !valid || saveMutation.isPending}
                onClick={() => saveMutation.mutate(setting.key)}
              >
                {saveMutation.isPending ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                Save
              </Button>
            </div>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background font-mono text-xs leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              value={editedValues[setting.key] || ''}
              onChange={(e) => handleChange(setting.key, e.target.value)}
              spellCheck={false}
            />
            {!valid && editedValues[setting.key] && (
              <p className="text-xs text-destructive">Invalid JSON — fix before saving</p>
            )}
            {setting.updated_at && (
              <p className="text-[10px] font-mono text-muted-foreground">
                Last updated: {new Date(setting.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
