"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@aura/design-system";
import { ArrowLeft, Download, Plug, Search } from "lucide-react";
import { pluginsApi } from "@aura/api-client";
import { useTranslation } from "react-i18next";
import Link from "next/link";

export default function InstallPluginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pluginUrl, setPluginUrl] = useState("");

  // Mock plugin catalog - in real implementation, this would come from an API
  const availablePlugins = [
    { id: "github", name: "GitHub", description: "Integrate with GitHub repositories and workflows" },
    { id: "slack", name: "Slack", description: "Send messages and notifications to Slack" },
    { id: "email", name: "Email", description: "Send and receive emails" },
    { id: "google-workspace", name: "Google Workspace", description: "Integrate with Google Workspace services" },
  ];

  const handleInstallFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pluginUrl) return;

    setLoading(true);
    try {
      await pluginsApi.install({
        id: pluginUrl,
        enabled: false,
      });
      router.push("/plugins");
    } catch (error) {
      console.error("Error installing plugin:", error);
      alert("Failed to install plugin. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInstallPlugin = async (pluginId: string) => {
    setLoading(true);
    try {
      await pluginsApi.install({
        id: pluginId,
        enabled: false,
      });
      router.push("/plugins");
    } catch (error) {
      console.error("Error installing plugin:", error);
      alert("Failed to install plugin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlugins = availablePlugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Link href="/plugins">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Plug className="h-8 w-8" />
            {t("plugins.install")}
          </h1>
          <p className="text-muted-foreground">
            Install plugins to extend AURA's functionality
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Install from URL</CardTitle>
          <CardDescription>
            Install a plugin from a URL or package name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInstallFromUrl} className="flex gap-2">
            <Input
              type="text"
              placeholder="https://example.com/plugin or @org/plugin"
              value={pluginUrl}
              onChange={(e) => setPluginUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !pluginUrl}>
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Installing..." : "Install"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Plugins</CardTitle>
          <CardDescription>
            Browse and install from the plugin catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredPlugins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No plugins found matching your search
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlugins.map((plugin) => (
                <Card key={plugin.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    <CardDescription>{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleInstallPlugin(plugin.id)}
                      disabled={loading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Install
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



