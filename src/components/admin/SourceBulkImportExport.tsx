import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  onImportComplete: () => void;
}

const EXPORT_FIELDS = [
  'name', 'slug', 'source_type', 'is_active', 'base_url', 'rss_url',
  'external_id', 'language', 'region_tags', 'country_tags',
  'reliability_score', 'bias_label', 'notes', 'ingest_method',
  'rate_limit_seconds',
];

export function SourceBulkImportExport({ onImportComplete }: Props) {
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJSON = async () => {
    const { data, error } = await supabase.from('sources').select('*').order('name');
    if (error) { toast.error('Export failed: ' + error.message); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `geolens-sources-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success(`Exported ${data.length} sources as JSON`);
  };

  const exportCSV = async () => {
    const { data, error } = await supabase.from('sources').select('*').order('name');
    if (error) { toast.error('Export failed: ' + error.message); return; }
    const header = EXPORT_FIELDS.join(',');
    const rows = (data || []).map(row =>
      EXPORT_FIELDS.map(f => {
        const val = (row as any)[f];
        if (Array.isArray(val)) return `"${val.join(';')}"`;
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) return `"${val.replace(/"/g, '""')}"`;
        return val ?? '';
      }).join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `geolens-sources-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${data.length} sources as CSV`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);

    try {
      const text = await file.text();
      let records: any[] = [];

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else if (file.name.endsWith('.csv')) {
        records = parseCSV(text);
      } else {
        toast.error('Unsupported file format. Use .json or .csv');
        setImporting(false);
        return;
      }

      // Validate and clean
      let skipped = 0;
      const valid = records.filter(r => {
        if (!r.name || !r.source_type) { skipped++; return false; }
        return true;
      }).map(r => ({
        name: String(r.name).trim().substring(0, 200),
        slug: r.slug || r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        source_type: r.source_type,
        is_active: r.is_active !== false && r.is_active !== 'false',
        base_url: r.base_url || null,
        rss_url: r.rss_url || null,
        external_id: r.external_id || null,
        language: r.language || 'en',
        region_tags: parseArrayField(r.region_tags),
        country_tags: parseArrayField(r.country_tags),
        reliability_score: parseFloat(r.reliability_score) || 0.5,
        bias_label: r.bias_label || null,
        notes: r.notes || null,
        ingest_method: r.ingest_method || 'rss',
        rate_limit_seconds: parseInt(r.rate_limit_seconds) || 60,
      }));

      if (valid.length === 0) {
        toast.error('No valid source records found in file');
        setImporting(false);
        return;
      }

      const { error } = await supabase.from('sources').upsert(valid, { onConflict: 'slug' });
      if (error) {
        toast.error('Import error: ' + error.message);
      } else {
        toast.success(`Imported ${valid.length} sources${skipped > 0 ? `, ${skipped} skipped (missing name/type)` : ''}`);
        onImportComplete();
      }
    } catch (err: any) {
      toast.error('Import failed: ' + err.message);
    }

    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" onClick={exportJSON}>
        <FileJson className="w-3 h-3 mr-1.5" /> Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <FileSpreadsheet className="w-3 h-3 mr-1.5" /> Export CSV
      </Button>
      <div className="relative">
        <Button variant="outline" size="sm" disabled={importing} onClick={() => fileRef.current?.click()}>
          <Upload className="w-3 h-3 mr-1.5" /> {importing ? 'Importing…' : 'Import'}
        </Button>
        <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={handleImport} />
      </div>
    </div>
  );
}

function parseArrayField(val: any): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string' && val) return val.split(';').map(s => s.trim()).filter(Boolean);
  return [];
}

function parseCSV(text: string): any[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj: any = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}
