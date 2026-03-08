import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSources } from "@/components/admin/AdminSources";
import { AdminJobs } from "@/components/admin/AdminJobs";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminDiagnostics } from "@/components/admin/AdminDiagnostics";

export default function Admin() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Source management · Ingestion · Configuration</p>
      </div>
      <Tabs defaultValue="diagnostics" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="jobs">Ingestion Jobs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="diagnostics"><AdminDiagnostics /></TabsContent>
        <TabsContent value="sources"><AdminSources /></TabsContent>
        <TabsContent value="jobs"><AdminJobs /></TabsContent>
        <TabsContent value="settings"><AdminSettings /></TabsContent>
      </Tabs>
    </div>
  );
}
