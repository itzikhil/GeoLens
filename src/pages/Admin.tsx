import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSources } from "@/components/admin/AdminSources";
import { AdminJobs } from "@/components/admin/AdminJobs";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminDiagnostics } from "@/components/admin/AdminDiagnostics";
import { AdminOperations } from "@/components/admin/AdminOperations";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";

export default function Admin() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations Console</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">Source management · Ingestion · Enrichment · Configuration</p>
      </div>
      <Tabs defaultValue="diagnostics" className="space-y-4">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="diagnostics">Health</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="diagnostics"><AdminDiagnostics /></TabsContent>
        <TabsContent value="operations"><AdminOperations /></TabsContent>
        <TabsContent value="jobs"><AdminJobs /></TabsContent>
        <TabsContent value="sources"><AdminSources /></TabsContent>
        <TabsContent value="settings"><AdminSettings /></TabsContent>
        <TabsContent value="audit"><AdminAuditLog /></TabsContent>
      </Tabs>
    </div>
  );
}
