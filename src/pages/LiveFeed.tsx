import { DEMO_ITEMS } from "@/lib/demo-data";
import { ItemCard } from "@/components/shared/ItemCard";

export default function LiveFeed() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Feed</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          {DEMO_ITEMS.length} items — all sources
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['All', 'Mainstream', 'Think Tank', 'Government', 'Social'].map(f => (
          <button key={f} className={`intel-badge ${f === 'All' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {DEMO_ITEMS.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
