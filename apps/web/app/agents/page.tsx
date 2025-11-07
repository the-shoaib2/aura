"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Skeleton } from "@aura/design-system";
import { Plus, Eye, Play, Square, Trash2, Bot } from "lucide-react";
import { agentsApi, type Agent } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AgentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await agentsApi.getAll();
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
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
            <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {t("agents.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your AI agents and their tasks
          </p>
        </div>
        <Link href="/agents/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("agents.create")}
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
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                  <Skeleton className="h-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12">
            <div className="text-center space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                No agents found. Create your first agent to get started.
              </p>
              <Link href="/agents/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t("agents.create")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{agent.name || agent.id}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {agent.tasksCompleted !== undefined
                    ? `${agent.tasksCompleted} ${t("agents.tasksCompleted").toLowerCase()}`
                    : "No tasks completed"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">{t("agents.status")}</span>
                  <Badge variant={getStatusVariant(agent.status)}>
                    {agent.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={() => router.push(`/agents/${agent.id}`)}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("common.view") || "View"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={async () => {
                      try {
                        await agentsApi.start(agent.id);
                        fetchAgents();
                      } catch (error) {
                        console.error("Error starting agent:", error);
                        alert("Failed to start agent");
                      }
                    }}
                  >
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("agents.start")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={async () => {
                      try {
                        await agentsApi.stop(agent.id);
                        fetchAgents();
                      } catch (error) {
                        console.error("Error stopping agent:", error);
                        alert("Failed to stop agent");
                      }
                    }}
                  >
                    <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("agents.stop")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this agent?")) {
                        try {
                          await agentsApi.delete(agent.id);
                          fetchAgents();
                        } catch (error) {
                          console.error("Error deleting agent:", error);
                          alert("Failed to delete agent");
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{t("agents.delete")}</span>
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
