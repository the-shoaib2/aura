"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Skeleton } from "@aura/design-system";
import { Activity, Bot, Workflow, Plug, Plus } from "lucide-react";
import { agentsApi, workflowsApi, pluginsApi } from "@aura/api-client";

export default function Dashboard() {
  const [stats, setStats] = useState({
    agents: 0,
    workflows: 0,
    plugins: 0,
    executions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch stats from analytics service using API client
      const [agentsRes, workflowsRes, pluginsRes] = await Promise.all([
        agentsApi.getAll().catch(() => ({ data: { total: 0 } })),
        workflowsApi.getAll().catch(() => ({ data: { total: 0 } })),
        pluginsApi.getAll().catch(() => ({ data: { total: 0 } })),
      ]);

      setStats({
        agents: agentsRes.data?.total || 0,
        workflows: workflowsRes.data?.total || 0,
        plugins: pluginsRes.data?.total || 0,
        executions: 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome to AURA - AI Automation Platform
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Agents</CardTitle>
                <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.agents}</div>
                <p className="text-xs text-muted-foreground">Active agents</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Workflows</CardTitle>
                <Workflow className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.workflows}</div>
                <p className="text-xs text-muted-foreground">Configured workflows</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Plugins</CardTitle>
                <Plug className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.plugins}</div>
                <p className="text-xs text-muted-foreground">Installed plugins</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Executions</CardTitle>
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{stats.executions}</div>
                <p className="text-xs text-muted-foreground">Total executions</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {loading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start text-sm" variant="outline" asChild>
                  <a href="/workflows/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Workflow
                  </a>
                </Button>
                <Button className="w-full justify-start text-sm" variant="outline" asChild>
                  <a href="/agents/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Agent
                  </a>
                </Button>
                <Button className="w-full justify-start text-sm" variant="outline" asChild>
                  <a href="/plugins/install">
                    <Plus className="mr-2 h-4 w-4" />
                    Install Plugin
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                  No recent activity
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
