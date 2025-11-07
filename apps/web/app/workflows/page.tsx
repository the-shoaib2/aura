"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Skeleton } from "@aura/design-system";
import { Plus, Edit, Play, Trash2, Workflow } from "lucide-react";
import { workflowsApi, type Workflow } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkflowsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await workflowsApi.getAll();
      setWorkflows(response.data.workflows || []);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {t("workflows.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and monitor your automation workflows
          </p>
        </div>
        <Link href="/workflows/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("workflows.create")}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12">
            <div className="text-center space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                No workflows found. Create your first workflow to get started.
              </p>
              <Link href="/workflows/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{workflow.name || workflow.id}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {workflow.lastRun
                    ? `Last run: ${new Date(workflow.lastRun).toLocaleDateString()}`
                    : "Never run"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t("workflows.status")}</span>
                  <Badge variant={getStatusVariant(workflow.status)}>
                    {workflow.status}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/workflows/${workflow.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {t("workflows.edit")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={async () => {
                      try {
                        await workflowsApi.run(workflow.id);
                        alert("Workflow execution started!");
                      } catch (error) {
                        console.error("Error running workflow:", error);
                        alert("Failed to run workflow");
                      }
                    }}
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t("workflows.run")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this workflow?")) {
                        try {
                          await workflowsApi.delete(workflow.id);
                          fetchWorkflows();
                        } catch (error) {
                          console.error("Error deleting workflow:", error);
                          alert("Failed to delete workflow");
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t("workflows.delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
