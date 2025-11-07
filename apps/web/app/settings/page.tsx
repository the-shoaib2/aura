"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@aura/design-system";
import { Settings, Server, Save, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">
          Manage your AURA platform configuration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.general")}</CardTitle>
            <CardDescription>Basic platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-name">Platform Name</Label>
              <Input id="platform-name" type="text" defaultValue="AURA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="UTC">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.api")}</CardTitle>
            <CardDescription>API and gateway settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gateway-url">Gateway URL</Label>
              <Input
                id="gateway-url"
                type="text"
                defaultValue={process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3000"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Enter API key" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              {t("settings.services")}
            </CardTitle>
            <CardDescription>Service status and health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Gateway</span>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Workflow Engine</span>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Agent Service</span>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Plugin Service</span>
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                  Online
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
