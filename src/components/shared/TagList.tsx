interface TagListProps {
  tags: string[];
  variant?: 'region' | 'topic' | 'actor';
}

const variantClass: Record<string, string> = {
  region: 'bg-accent/15 text-accent',
  topic: 'bg-primary/10 text-primary',
  actor: 'bg-secondary text-secondary-foreground',
};

export function TagList({ tags, variant = 'region' }: TagListProps) {
  if (!tags.length) return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {tags.map((tag) => (
        <span key={tag} className={`text-xs px-1.5 py-0.5 rounded font-mono ${variantClass[variant]}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}
