import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "./SearchBar";
import { RegionSelector } from "./RegionSelector";

export function AppLayout() {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center gap-3 border-b border-border px-4 bg-card shrink-0">
          <SidebarTrigger className="shrink-0" />
          <RegionSelector />
          <SearchBar />
          <div className="flex items-center gap-2 ml-auto">
            <span className="data-label">GEOLENS</span>
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--signal-active))] animate-pulse-amber" />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
