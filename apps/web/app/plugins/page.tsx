"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Switch, Label, Badge, Skeleton } from "@aura/design-system";
import { Plus, Settings, Trash2, Plug } from "lucide-react";
import { pluginsApi, type Plugin } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PluginsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await pluginsApi.getAll();
      setPlugins(response.data.plugins || []);
    } catch (error) {
      console.error("Error fetching plugins:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await pluginsApi.enable(pluginId);
      } else {
        await pluginsApi.disable(pluginId);
      }
      fetchPlugins(); // Refresh list
    } catch (error) {
      console.error("Error toggling plugin:", error);
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Plug className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            {t("plugins.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and configure your installed plugins
          </p>
        </div>
        <Link href="/plugins/install" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t("plugins.install")}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plugins.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12">
            <div className="text-center space-y-4">
              <p className="text-sm sm:text-base text-muted-foreground">
                No plugins installed. Install your first plugin to get started.
              </p>
              <Link href="/plugins/install">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {t("plugins.install")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => (
            <Card key={plugin.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">{plugin.name || plugin.id}</CardTitle>
                  {plugin.version && (
                    <Badge variant="secondary" className="text-xs">v{plugin.version}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`plugin-${plugin.id}`} className="cursor-pointer text-xs sm:text-sm">
                    {plugin.enabled ? t("plugins.enable") : t("plugins.disable")}
                  </Label>
                  <Switch
                    id={`plugin-${plugin.id}`}
                    checked={plugin.enabled}
                    onCheckedChange={(checked) => togglePlugin(plugin.id, checked)}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => router.push(`/plugins/${plugin.id}/configure`)}
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t("plugins.configure")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={async () => {
                      if (confirm("Are you sure you want to uninstall this plugin?")) {
                        try {
                          await pluginsApi.uninstall(plugin.id);
                          fetchPlugins();
                        } catch (error) {
                          console.error("Error uninstalling plugin:", error);
                          alert("Failed to uninstall plugin");
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t("plugins.uninstall")}
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
