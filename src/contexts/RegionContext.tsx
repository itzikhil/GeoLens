import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { REGIONS, RegionDef } from "@/lib/region-data";

interface RegionContextValue {
  activeRegion: RegionDef | null;
  setActiveRegion: (region: RegionDef | null) => void;
  activeSubregion: string | null;
  setActiveSubregion: (slug: string | null) => void;
  isFiltered: boolean;
  matchesRegion: (tags: string[]) => boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [activeRegion, setActiveRegionState] = useState<RegionDef | null>(() => {
    const saved = localStorage.getItem("geolens_region_filter");
    if (saved) {
      const found = REGIONS.find(r => r.slug === saved);
      return found || null;
    }
    return null;
  });
  const [activeSubregion, setActiveSubregion] = useState<string | null>(null);

  const setActiveRegion = (region: RegionDef | null) => {
    setActiveRegionState(region);
    setActiveSubregion(null);
    if (region) {
      localStorage.setItem("geolens_region_filter", region.slug);
    } else {
      localStorage.removeItem("geolens_region_filter");
    }
  };

  const isFiltered = activeRegion !== null;

  const matchesRegion = (tags: string[]) => {
    if (!activeRegion) return true;
    return tags.some(t => {
      const lower = t.toLowerCase();
      if (activeRegion.name.toLowerCase() === lower) return true;
      if (activeRegion.countries.some(c => c.toLowerCase() === lower)) return true;
      if (activeRegion.subregions.some(s => s.name.toLowerCase() === lower || s.countries.some(c => c.toLowerCase() === lower))) return true;
      return false;
    });
  };

  return (
    <RegionContext.Provider value={{ activeRegion, setActiveRegion, activeSubregion, setActiveSubregion, isFiltered, matchesRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionFilter() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegionFilter must be used within RegionProvider");
  return ctx;
}
