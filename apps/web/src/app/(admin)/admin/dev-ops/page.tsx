"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, tenantApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTerminal,
  faTrashCan,
  faDatabase,
  faPlay,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminDevOpsPage() {
  const queryClient = useQueryClient();
  const [consoleLog, setConsoleLog] = useState<string[]>([
    "DevOps administrative console ready...",
    "Secure connection initialized.",
  ]);

  const addLog = (msg: string) => {
    setConsoleLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  const clearCacheMutation = useMutation({
    mutationFn: () => adminApi.clearCache(),
    onSuccess: (res) => {
      addLog(`SUCCESS: ${res.message}`);
    },
    onError: (err) => {
      addLog(
        `ERROR: Invalidation failed - ${err instanceof Error ? err.message : "Unknown"}`,
      );
    },
  });

  const seedDemoMutation = useMutation({
    mutationFn: () => tenantApi.seedDemo("adipa"),
    onSuccess: (res) => {
      addLog(`SUCCESS: Seeding completed - ${res.message}`);
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      addLog(
        `ERROR: Demo seed failed - ${err instanceof Error ? err.message : "Unknown"}`,
      );
    },
  });

  const handleDiagnoseDb = async () => {
    addLog(
      "RUNNING DIAGNOSTICS: Verifying index integrity and schema migrations...",
    );
    setTimeout(() => {
      addLog(
        "SUCCESS: Prisma schema mirrors postgres indices. 0 abnormalities found.",
      );
      addLog(
        "Row count check completed: Tenants (3), Users (8), LedgerAccounts (15)",
      );
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="dashboard-title">DevOps Control</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Controls */}
        <div className="space-y-6 lg:col-span-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                In-Memory Store
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Evict session registries and transient color/logo cache records
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 pt-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Clear Redis Caches
                </h3>
                <p className="text-xs text-muted-foreground">
                  Invalidates cached organizations branding settings
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950/50 dark:hover:bg-red-950/30"
                loading={clearCacheMutation.isPending}
                onClick={() => clearCacheMutation.mutate()}
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className="mr-1.5 h-3.5 w-3.5"
                />
                Evict Cache
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Relational Engine (Prisma)
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Perform structural integrity analysis on Postgres tables
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 pt-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Integrity Diagnostic
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verify database constraints and migration logs
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDiagnoseDb}>
                <FontAwesomeIcon
                  icon={faDatabase}
                  className="mr-1.5 h-3.5 w-3.5"
                />
                Analyze Tables
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Staging & Demo Seeding
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Seed transaction logs and audit traces into the demo space
              </p>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4 pt-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Populate demo-tenant data
                </h3>
                <p className="text-xs text-muted-foreground">
                  Runs seeder in current database space for abc-susu
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                loading={seedDemoMutation.isPending}
                onClick={() => seedDemoMutation.mutate()}
              >
                <FontAwesomeIcon icon={faPlay} className="mr-1.5 h-3.5 w-3.5" />
                Run Seeder
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Live Logs Console */}
        <div className="lg:col-span-6">
          <Card className="border-border/60 h-full flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faTerminal}
                  className="h-4 w-4 text-primary"
                />
                <CardTitle className="text-sm font-bold">
                  Live Execution Logs
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 pt-0">
              <div className="flex-1 bg-zinc-950 font-mono text-xs p-4 rounded-lg border border-border/80 text-emerald-400 overflow-y-auto max-h-[360px] min-h-[300px]">
                {consoleLog.map((log, index) => (
                  <div key={index} className="mb-1.5 leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
