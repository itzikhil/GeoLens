interface ScoreIndicatorProps {
  label: string;
  value: number;
}

export function ScoreIndicator({ label, value }: ScoreIndicatorProps) {
  const pct = Math.round(value * 100);
  const colorClass = value >= 0.8 ? 'text-score-high' : value >= 0.5 ? 'text-score-medium' : 'text-score-low';

  return (
    <div className="flex items-center gap-1.5">
      <span className="data-label">{label}</span>
      <span className={`text-xs font-mono font-semibold ${colorClass}`}>{pct}</span>
    </div>
  );
}
