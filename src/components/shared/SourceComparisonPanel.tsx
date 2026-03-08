import { ScoreIndicator } from "./ScoreIndicator";
import { ExternalLink, Eye } from "lucide-react";
import { useState } from "react";

interface ComparisonItem {
  id: string;
  title: string;
  source_type: string;
  summary_short: string | null;
  stance_label: string | null;
  sentiment_label: string | null;
  credibility_score: number | null;
  importance_score: number | null;
  url: string | null;
  author: string | null;
  published_at: string | null;
}

interface SourceComparisonPanelProps {
  items: ComparisonItem[];
  clusterTitle?: string;
}

const SOURCE_CATEGORIES: { key: string; label: string; types: string[]; color: string }[] = [
  { key: 'mainstream', label: 'Mainstream', types: ['mainstream'], color: 'bg-primary/10 text-primary border-primary/20' },
  { key: 'state', label: 'State-Affiliated', types: ['government'], color: 'bg-destructive/10 text-destructive border-destructive/20' },
  { key: 'niche', label: 'Niche / Independent', types: ['niche', 'rss', 'custom', 'api'], color: 'bg-accent/10 text-accent border-accent/20' },
  { key: 'think_tank', label: 'Think Tank', types: ['think_tank'], color: 'bg-[hsl(var(--chart-4)/0.1)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.2)]' },
  { key: 'social', label: 'Social Source', types: ['x', 'telegram', 'youtube'], color: 'bg-[hsl(var(--signal-emerging)/0.1)] text-[hsl(var(--signal-emerging))] border-[hsl(var(--signal-emerging)/0.2)]' },
  { key: 'analyst', label: 'Analyst / Podcast', types: ['podcast'], color: 'bg-secondary text-secondary-foreground border-border' },
];

function categorize(sourceType: string): string {
  for (const cat of SOURCE_CATEGORIES) {
    if (cat.types.includes(sourceType)) return cat.key;
  }
  return 'niche';
}

function getStanceColor(stance: string | null): string {
  if (!stance) return 'text-muted-foreground';
  const s = stance.toLowerCase();
  if (s.includes('support') || s.includes('pro') || s.includes('positive')) return 'text-[hsl(var(--score-high))]';
  if (s.includes('critical') || s.includes('against') || s.includes('negative') || s.includes('oppose')) return 'text-[hsl(var(--score-low))]';
  return 'text-[hsl(var(--score-medium))]';
}

export function SourceComparisonPanel({ items, clusterTitle }: SourceComparisonPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group items by category
  const grouped: Record<string, ComparisonItem[]> = {};
  for (const item of items) {
    const cat = categorize(item.source_type || 'unknown');
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const activeCats = SOURCE_CATEGORIES.filter(c => grouped[c.key]?.length > 0);

  if (activeCats.length === 0) {
    return (
      <div className="intel-card text-center py-8">
        <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No items to compare across sources</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category overview strip */}
      <div className="flex flex-wrap gap-2">
        {activeCats.map(cat => (
          <button
            key={cat.key}
            onClick={() => setExpandedCategory(expandedCategory === cat.key ? null : cat.key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${cat.color} ${
              expandedCategory === cat.key ? 'ring-1 ring-ring shadow-sm' : 'opacity-80 hover:opacity-100'
            }`}
          >
            {cat.label}
            <span className="font-bold">{grouped[cat.key].length}</span>
          </button>
        ))}
      </div>

      {/* Comparison grid */}
      <div className={`grid gap-3 ${activeCats.length >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : activeCats.length === 2 ? 'md:grid-cols-2' : ''}`}>
        {activeCats
          .filter(cat => !expandedCategory || expandedCategory === cat.key)
          .map(cat => {
            const catItems = grouped[cat.key];
            return (
              <div key={cat.key} className={`rounded-lg border p-4 space-y-3 ${cat.color.split(' ').filter(c => c.startsWith('border-')).join(' ')} bg-card`}>
                {/* Category header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider">{cat.label}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{catItems.length} source{catItems.length > 1 ? 's' : ''}</span>
                </div>

                {/* Items in this category */}
                <div className="space-y-3">
                  {catItems.map(item => (
                    <div key={item.id} className="space-y-1.5 pb-3 border-b border-border last:border-0 last:pb-0">
                      {/* Title + link */}
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{item.title}</p>
                          {item.author && (
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">{item.author}</p>
                          )}
                        </div>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary transition-colors" title="Open source">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Summary framing */}
                      {item.summary_short && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.summary_short}</p>
                      )}

                      {/* Stance + scores */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.stance_label && (
                          <span className={`text-xs font-mono font-medium ${getStanceColor(item.stance_label)}`}>
                            {item.stance_label}
                          </span>
                        )}
                        {item.sentiment_label && !item.stance_label && (
                          <span className={`text-xs font-mono font-medium ${getStanceColor(item.sentiment_label)}`}>
                            {item.sentiment_label}
                          </span>
                        )}
                        {item.credibility_score != null && (
                          <ScoreIndicator label="CRD" value={item.credibility_score} />
                        )}
                        {item.importance_score != null && (
                          <ScoreIndicator label="IMP" value={item.importance_score} />
                        )}
                        {item.published_at && (
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                            {new Date(item.published_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      {/* Cross-source narrative summary */}
      {activeCats.length >= 2 && (
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Narrative Divergence
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This event is covered by <span className="font-medium text-foreground">{activeCats.length} source categories</span> across{' '}
            <span className="font-medium text-foreground">{items.length} items</span>.
            {activeCats.some(c => c.key === 'mainstream') && activeCats.some(c => c.key === 'social') &&
              ' Compare mainstream framing against social source perspectives for information gaps.'
            }
            {activeCats.some(c => c.key === 'state') &&
              ' State-affiliated sources present — cross-reference with independent coverage for bias detection.'
            }
            {activeCats.some(c => c.key === 'think_tank') &&
              ' Think tank analysis available for deeper strategic context.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
