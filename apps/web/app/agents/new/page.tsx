"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@aura/design-system";
import { ArrowLeft, Save, Bot } from "lucide-react";
import { agentsApi } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function NewAgentPage() {
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
      const response = await agentsApi.create({
        name: formData.name,
        status: "inactive",
      });

      if (response.data?.id) {
        router.push("/agents");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      alert("Failed to create agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8" />
            {t("agents.create")}
          </h1>
          <p className="text-muted-foreground">
            Create a new AI agent
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Agent Details</CardTitle>
            <CardDescription>
              Enter the basic information for your new AI agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="My Agent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Describe what this agent does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/agents">
            <Button variant="outline" type="button">
              {t("common.cancel")}
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.name}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : t("common.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}

