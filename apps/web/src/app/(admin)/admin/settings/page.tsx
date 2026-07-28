"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faCircleCheck,
  faSave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [globalRateLimit, setGlobalRateLimit] = useState<number>(100);
  const [backupSchedule, setBackupSchedule] = useState<string>("daily");
  const [smsProvider, setSmsProvider] = useState<string>("twilio");
  const [transactionFeePercent, setTransactionFeePercent] =
    useState<number>(1.0);
  const [systemEmail, setSystemEmail] = useState<string>("system@susuflow.com");

  // Load current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-global-settings"],
    queryFn: () => adminApi.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenanceMode);
      setGlobalRateLimit(settings.globalRateLimit);
      setBackupSchedule(settings.backupSchedule);
      setSmsProvider(settings.smsProvider);
      setTransactionFeePercent(settings.transactionFeePercent);
      setSystemEmail(settings.systemEmail);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateSettings(data),
    onSuccess: (res) => {
      setSuccessMsg(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-global-settings"] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      maintenanceMode,
      globalRateLimit,
      backupSchedule,
      smsProvider,
      transactionFeePercent,
      systemEmail,
    });
  };

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="dashboard-title">Configuration</h1>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <FontAwesomeIcon icon={faCircleCheck} className="mr-2 text-primary" />
          {successMsg}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-40 w-full animate-pulse rounded-lg bg-muted/65" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-muted/65" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* System Control Settings */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Operational Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div>
                  <label className="text-sm font-semibold text-foreground">
                    Platform Maintenance Mode
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Blocks API requests from company staff and savers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">
                    Global Rate Limit (Req/Min)
                  </label>
                  <Input
                    type="number"
                    value={globalRateLimit}
                    onChange={(e) => setGlobalRateLimit(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">
                    System Sender Email
                  </label>
                  <Input
                    type="email"
                    value={systemEmail}
                    onChange={(e) => setSystemEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee & Billing Settings */}
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                Transactional & Integration Config
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">
                    Platform Fee Percent (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={transactionFeePercent}
                    onChange={(e) =>
                      setTransactionFeePercent(Number(e.target.value))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase">
                    SMS Gateway Channel
                  </label>
                  <select
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary h-11"
                  >
                    <option value="twilio">Twilio SMS Router</option>
                    <option value="africastalking">
                      Africas Talking Gateway
                    </option>
                    <option value="hubtel">Hubtel Ghana Gateway</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase">
                  DB Snapshot & Backup Schedule
                </label>
                <select
                  value={backupSchedule}
                  onChange={(e) => setBackupSchedule(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary h-11"
                >
                  <option value="hourly">Hourly Incremental Backups</option>
                  <option value="daily">Daily Cold Backups (UTC 00:00)</option>
                  <option value="weekly">Weekly Full Snapshots</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={updateMutation.isPending}>
              <FontAwesomeIcon icon={faSave} className="mr-1.5 h-3.5 w-3.5" />
              Save Configuration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
