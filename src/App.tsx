import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppLayout } from "@/components/layout/AppLayout";
import Overview from "./pages/Overview";
import LiveFeed from "./pages/LiveFeed";
import EventClusters from "./pages/EventClusters";
import ClusterDetail from "./pages/ClusterDetail";
import Regions from "./pages/Regions";
import Actors from "./pages/Actors";
import Narratives from "./pages/Narratives";
import Sources from "./pages/Sources";
import Watchlists from "./pages/Watchlists";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Overview />} />
              <Route path="/feed" element={<LiveFeed />} />
              <Route path="/clusters" element={<EventClusters />} />
              <Route path="/clusters/:slug" element={<ClusterDetail />} />
              <Route path="/regions" element={<Regions />} />
              <Route path="/actors" element={<Actors />} />
              <Route path="/narratives" element={<Narratives />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/watchlists" element={<Watchlists />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
