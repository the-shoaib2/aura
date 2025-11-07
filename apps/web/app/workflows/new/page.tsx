"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@aura/design-system";
import { ArrowLeft, Save, Workflow } from "lucide-react";
import { workflowsApi } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function NewWorkflowPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await workflowsApi.create({
        name: formData.name,
        status: "inactive",
      });

      if (response.data?.id) {
        router.push(`/workflows/${response.data.id}/edit`);
      }
    } catch (error) {
      console.error("Error creating workflow:", error);
      alert("Failed to create workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-4xl">
      <div className="flex items-center gap-2 sm:gap-4">
        <Link href="/workflows">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {t("workflows.create")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create a new automation workflow
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Workflow Details</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Enter the basic information for your new workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Workflow Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="My Workflow"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Describe what this workflow does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="text-sm sm:text-base"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
          <Link href="/workflows" className="w-full sm:w-auto">
            <Button variant="outline" type="button" className="w-full sm:w-auto">
              {t("common.cancel")}
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.name} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : t("common.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}

