import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  SourceFormData,
  EMPTY_SOURCE,
  SOURCE_TYPE_OPTIONS,
  LANGUAGE_OPTIONS,
  BIAS_OPTIONS,
  REGION_OPTIONS,
  SOURCE_TEMPLATES,
} from "@/lib/source-templates";

interface SourceFormProps {
  initialData?: Partial<SourceFormData> & { id?: string; slug?: string };
  onSubmit: (data: SourceFormData & { id?: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function SourceForm({ initialData, onSubmit, onCancel, isSubmitting }: SourceFormProps) {
  const [form, setForm] = useState<SourceFormData>({ ...EMPTY_SOURCE, ...initialData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState({ region: '', country: '', topic: '' });

  useEffect(() => {
    if (initialData) setForm(prev => ({ ...prev, ...initialData }));
  }, [initialData]);

  const update = (field: keyof SourceFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const addTag = (field: 'region_tags' | 'country_tags' | 'topic_tags', value: string) => {
    const v = value.trim();
    if (v && !form[field].includes(v)) {
      update(field, [...form[field], v]);
    }
  };

  const removeTag = (field: 'region_tags' | 'country_tags' | 'topic_tags', value: string) => {
    update(field, form[field].filter(t => t !== value));
  };

  const applyTemplate = (tpl: typeof SOURCE_TEMPLATES[0]) => {
    setForm(prev => ({ ...prev, ...tpl.defaults }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Source name is required';
    if (form.name.length > 200) e.name = 'Name must be under 200 characters';
    if (!form.source_type) e.source_type = 'Source type is required';
    if (form.base_url && !/^https?:\/\/.+/.test(form.base_url)) e.base_url = 'Must be a valid URL';
    if (form.rss_url && !/^https?:\/\/.+/.test(form.rss_url)) e.rss_url = 'Must be a valid URL';
    if (form.source_type === 'rss' && !form.rss_url) e.rss_url = 'RSS URL required for RSS sources';
    if (form.source_type === 'mainstream' && !form.rss_url && !form.base_url) e.base_url = 'URL or RSS feed required';
    if (form.source_type === 'youtube' && !form.youtube_channel_id && !form.external_id) e.youtube_channel_id = 'YouTube channel ID required';
    if (form.source_type === 'x' && !form.x_handle && !form.external_id) e.x_handle = 'X handle or list ID required';
    if (form.source_type === 'telegram' && !form.telegram_channel && !form.external_id) e.telegram_channel = 'Telegram channel username required';
    if (form.source_type === 'podcast' && !form.podcast_feed_url && !form.rss_url) e.podcast_feed_url = 'Podcast feed URL required';
    if (form.reliability_score < 0 || form.reliability_score > 1) e.reliability_score = 'Must be between 0 and 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      ...form,
      id: initialData?.id,
    });
  };

  const showField = (field: string) => {
    const t = form.source_type;
    const fieldMap: Record<string, string[]> = {
      rss_url: ['mainstream', 'niche', 'think_tank', 'government', 'rss', 'podcast', 'custom'],
      x_handle: ['x'],
      telegram_channel: ['telegram'],
      youtube_channel_id: ['youtube'],
      podcast_feed_url: ['podcast'],
      external_id: ['api', 'x', 'telegram', 'youtube', 'custom'],
    };
    return !fieldMap[field] || fieldMap[field].includes(t);
  };

  return (
    <div className="space-y-6">
      {/* Templates */}
      {!initialData?.id && (
        <div className="space-y-2">
          <Label className="data-label">Quick Start Template</Label>
          <div className="flex flex-wrap gap-1.5">
            {SOURCE_TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                onClick={() => applyTemplate(tpl)}
                className="intel-badge bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors"
                title={tpl.description}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Core Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Source Name *</Label>
          <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Reuters, ISW, @osikinaTV" />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="source_type">Source Type *</Label>
          <Select value={form.source_type} onValueChange={v => update('source_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SOURCE_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.source_type && <p className="text-xs text-destructive">{errors.source_type}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={form.is_active} onCheckedChange={v => update('is_active', v)} id="is_active" />
        <Label htmlFor="is_active" className="cursor-pointer">Source enabled</Label>
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Homepage URL</Label>
          <Input value={form.base_url} onChange={e => update('base_url', e.target.value)} placeholder="https://reuters.com" />
          {errors.base_url && <p className="text-xs text-destructive">{errors.base_url}</p>}
        </div>
        {showField('rss_url') && (
          <div className="space-y-1.5">
            <Label>RSS / Feed URL</Label>
            <Input value={form.rss_url} onChange={e => update('rss_url', e.target.value)} placeholder="https://feeds.reuters.com/reuters/topNews" />
            {errors.rss_url && <p className="text-xs text-destructive">{errors.rss_url}</p>}
          </div>
        )}
      </div>

      {/* Platform-specific fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showField('x_handle') && (
          <div className="space-y-1.5">
            <Label>X Handle or List ID</Label>
            <Input value={form.x_handle} onChange={e => update('x_handle', e.target.value)} placeholder="@handle or list:123456" />
            {errors.x_handle && <p className="text-xs text-destructive">{errors.x_handle}</p>}
          </div>
        )}
        {showField('telegram_channel') && (
          <div className="space-y-1.5">
            <Label>Telegram Channel Username</Label>
            <Input value={form.telegram_channel} onChange={e => update('telegram_channel', e.target.value)} placeholder="@channelname" />
            {errors.telegram_channel && <p className="text-xs text-destructive">{errors.telegram_channel}</p>}
          </div>
        )}
        {showField('youtube_channel_id') && (
          <div className="space-y-1.5">
            <Label>YouTube Channel ID</Label>
            <Input value={form.youtube_channel_id} onChange={e => update('youtube_channel_id', e.target.value)} placeholder="UCxxxxxxxxxx" />
            {errors.youtube_channel_id && <p className="text-xs text-destructive">{errors.youtube_channel_id}</p>}
          </div>
        )}
        {showField('podcast_feed_url') && (
          <div className="space-y-1.5">
            <Label>Podcast Feed URL</Label>
            <Input value={form.podcast_feed_url} onChange={e => update('podcast_feed_url', e.target.value)} placeholder="https://feeds.example.com/podcast.xml" />
            {errors.podcast_feed_url && <p className="text-xs text-destructive">{errors.podcast_feed_url}</p>}
          </div>
        )}
        {showField('external_id') && (
          <div className="space-y-1.5">
            <Label>External Identifier</Label>
            <Input value={form.external_id} onChange={e => update('external_id', e.target.value)} placeholder="API key, channel ID, etc." />
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Region Tags</Label>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {form.region_tags.map(t => (
              <Badge key={t} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag('region_tags', t)}>
                {t} <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {REGION_OPTIONS.filter(r => !form.region_tags.includes(r)).map(r => (
              <button key={r} onClick={() => addTag('region_tags', r)} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors">
                + {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Country Tags</Label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {form.country_tags.map(t => (
                <Badge key={t} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag('country_tags', t)}>
                  {t} <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input value={tagInput.country} onChange={e => setTagInput(p => ({ ...p, country: e.target.value }))} placeholder="Add country…" className="h-8 text-xs"
                onKeyDown={e => { if (e.key === 'Enter') { addTag('country_tags', tagInput.country); setTagInput(p => ({ ...p, country: '' })); } }} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Topic Tags</Label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {form.topic_tags.map(t => (
                <Badge key={t} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag('topic_tags', t)}>
                  {t} <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-1.5">
              <Input value={tagInput.topic} onChange={e => setTagInput(p => ({ ...p, topic: e.target.value }))} placeholder="Add topic…" className="h-8 text-xs"
                onKeyDown={e => { if (e.key === 'Enter') { addTag('topic_tags', tagInput.topic); setTagInput(p => ({ ...p, topic: '' })); } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Language</Label>
          <Select value={form.language} onValueChange={v => update('language', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Bias / Narrative Label</Label>
          <Select value={form.bias_label || ''} onValueChange={v => update('bias_label', v)}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              {BIAS_OPTIONS.map(o => <SelectItem key={o || '__none'} value={o || ''}>{o || 'None'}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Reliability Score: {Math.round(form.reliability_score * 100)}</Label>
          <Slider value={[form.reliability_score * 100]} onValueChange={v => update('reliability_score', v[0] / 100)} min={0} max={100} step={1} className="mt-2" />
          {errors.reliability_score && <p className="text-xs text-destructive">{errors.reliability_score}</p>}
        </div>
      </div>

      {/* Ingestion config */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label>Ingest Method</Label>
          <Select value={form.ingest_method} onValueChange={v => update('ingest_method', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rss">RSS</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="scrape">Scrape</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Rate Limit (seconds)</Label>
          <Input type="number" value={form.rate_limit_seconds} onChange={e => update('rate_limit_seconds', parseInt(e.target.value) || 60)} min={10} />
        </div>
        <div className="space-y-1.5">
          <Label>Polling Interval (minutes)</Label>
          <Input type="number" value={form.polling_interval_minutes} onChange={e => update('polling_interval_minutes', parseInt(e.target.value) || 15)} min={5} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label>Notes / Parser Rules</Label>
        <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Parser-specific notes, special handling rules, reliability justification…" rows={3} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialData?.id ? 'Update Source' : 'Create Source'}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
