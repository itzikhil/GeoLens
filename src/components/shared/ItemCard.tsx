import { ScoreIndicator } from "./ScoreIndicator";

interface ItemCardProps {
  item: {
    id: string;
    title: string;
    source_name: string;
    source_type: string;
    media_type: string;
    published_at: string;
    region_tags: string[];
    topic_tags: string[];
    actor_tags: string[];
    credibility_score: number;
    importance_score: number;
    summary_short: string;
  };
}

export function ItemCard({ item }: ItemCardProps) {
  const timeAgo = getTimeAgo(item.published_at);

  return (
    <div className="intel-card space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-primary">{item.source_name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground font-mono">{item.source_type}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground font-mono">{timeAgo}</span>
          </div>
          <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.summary_short}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <ScoreIndicator label="IMP" value={item.importance_score} />
          <ScoreIndicator label="CRD" value={item.credibility_score} />
        </div>
      </div>
      <div className="flex gap-1 flex-wrap">
        {item.region_tags.map(t => (
          <span key={t} className="text-xs px-1.5 py-0.5 rounded font-mono bg-accent/15 text-accent">{t}</span>
        ))}
        {item.topic_tags.map(t => (
          <span key={t} className="text-xs px-1.5 py-0.5 rounded font-mono bg-primary/10 text-primary">{t}</span>
        ))}
        {item.actor_tags.map(t => (
          <span key={t} className="text-xs px-1.5 py-0.5 rounded font-mono bg-secondary text-secondary-foreground">{t}</span>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
