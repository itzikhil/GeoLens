import { Bookmark } from "lucide-react";

export default function Watchlists() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlists</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Your custom intelligence feeds</p>
      </div>
      <div className="intel-card flex flex-col items-center justify-center py-12 text-center">
        <Bookmark className="w-10 h-10 text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">No watchlists yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create watchlists to track specific regions, actors, topics, or event clusters. Sign in to get started.
        </p>
      </div>
    </div>
  );
}
