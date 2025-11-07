"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Badge } from "@aura/design-system";
import { ArrowLeft, Save, Play, Trash2, Workflow } from "lucide-react";
import { workflowsApi, type Workflow } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function EditWorkflowPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  // Handle params.id which could be string or string[]
  const workflowId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "inactive",
  });

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    } else {
      setError("Workflow ID is missing");
      setLoading(false);
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    if (!workflowId) return;

    try {
      setError(null);
      const response = await workflowsApi.getById(workflowId);
      setWorkflow(response.data);
      setFormData({
        name: response.data.name || "",
        status: response.data.status || "inactive",
      });
    } catch (error: any) {
      console.error("Error fetching workflow:", error);
      if (error.response?.status === 404) {
        setError("Workflow not found");
      } else {
        setError("Failed to load workflow. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!workflowId) return;

    setSaving(true);
    try {
      await workflowsApi.update(workflowId, formData);
      router.push("/workflows");
    } catch (error) {
      console.error("Error updating workflow:", error);
      alert("Failed to update workflow. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    if (!workflowId) return;

    try {
      await workflowsApi.run(workflowId);
      alert("Workflow execution started!");
    } catch (error) {
      console.error("Error running workflow:", error);
      alert("Failed to run workflow. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!workflowId) return;
    if (!confirm("Are you sure you want to delete this workflow?")) return;

    try {
      await workflowsApi.delete(workflowId);
      router.push("/workflows");
    } catch (error) {
      console.error("Error deleting workflow:", error);
      alert("Failed to delete workflow. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {t("common.loading")}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || (!loading && !workflow)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground text-lg">
                {error || "Workflow not found"}
              </p>
              <Link href="/workflows">
                <Button variant="outline">Back to Workflows</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Workflow className="h-8 w-8" />
              {workflow.name || workflow.id}
            </h1>
            <p className="text-muted-foreground">
              Edit and configure your workflow
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === "active" ? "default" : "secondary"}>
            {formData.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Configuration</CardTitle>
              <CardDescription>
                Update workflow settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Editor</CardTitle>
              <CardDescription>
                Build your workflow by adding nodes and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Workflow editor will be implemented here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop nodes to build your automation workflow
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : t("common.save")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleRun}
              >
                <Play className="h-4 w-4 mr-2" />
                {t("workflows.run")}
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("workflows.delete")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono">{workflow.id}</span>
              </div>
              {workflow.lastRun && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Run:</span>
                  <span>{new Date(workflow.lastRun).toLocaleString()}</span>
                </div>
              )}
              {workflow.createdAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

