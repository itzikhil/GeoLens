import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder="Search events, actors, regions..."
        className="pl-8 h-8 bg-secondary border-none text-sm font-mono"
      />
    </div>
  );
}
