import { Globe, X, ChevronDown } from "lucide-react";
import { useRegionFilter } from "@/contexts/RegionContext";
import { REGIONS } from "@/lib/region-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

export function RegionSelector() {
  const { activeRegion, setActiveRegion, isFiltered } = useRegionFilter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors border ${
          isFiltered
            ? 'border-primary/50 bg-primary/10 text-primary'
            : 'border-border bg-card text-muted-foreground hover:text-foreground'
        }`}>
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{activeRegion ? activeRegion.name : 'All Regions'}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => setActiveRegion(null)} className="font-mono text-xs">
          <Globe className="h-3.5 w-3.5 mr-2" />
          All Regions
          {!isFiltered && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {REGIONS.map(region => {
          const isActive = activeRegion?.slug === region.slug;
          if (region.subregions.length > 0) {
            return (
              <DropdownMenuSub key={region.slug}>
                <DropdownMenuSubTrigger className="font-mono text-xs">
                  <span className="mr-2">{region.emoji}</span>
                  {region.name}
                  {isActive && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  <DropdownMenuItem onClick={() => setActiveRegion(region)} className="font-mono text-xs font-medium">
                    All {region.name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {region.subregions.map(sub => (
                    <DropdownMenuItem key={sub.slug} onClick={() => setActiveRegion(region)} className="font-mono text-xs pl-4">
                      {sub.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            );
          }
          return (
            <DropdownMenuItem key={region.slug} onClick={() => setActiveRegion(region)} className="font-mono text-xs">
              <span className="mr-2">{region.emoji}</span>
              {region.name}
              {isActive && <span className="ml-auto text-primary">✓</span>}
            </DropdownMenuItem>
          );
        })}
        {isFiltered && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActiveRegion(null)} className="text-xs text-destructive">
              <X className="h-3.5 w-3.5 mr-2" />
              Clear Filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
