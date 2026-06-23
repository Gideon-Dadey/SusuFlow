'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faFilter, faSpinner, faShield } from '@fortawesome/free-solid-svg-icons';

export default function AdminFraudPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Fetch tenants for filter
  const { data: tenantsData } = useQuery({
    queryKey: ['admin-tenants-list'],
    queryFn: () => adminApi.listTenants(),
  });

  // Fetch global fraud alerts
  const { data: fraudData, isLoading, isFetching } = useQuery({
    queryKey: ['admin-global-fraud', selectedTenant, selectedStatus],
    queryFn: () =>
      adminApi.listFraud({
        tenant_id: selectedTenant || undefined,
        status: selectedStatus || undefined,
      }),
  });

  const tenants = tenantsData?.items ?? [];
  const alerts = fraudData?.items ?? [];

  const getSeverityBadge = (severity: string) => {
    const sev = severity.toLowerCase();
    if (sev === 'critical') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300 animate-pulse">
          Critical
        </span>
      );
    }
    if (sev === 'high') {
      return (
        <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-950/80 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:text-orange-300">
          High
        </span>
      );
    }
    if (sev === 'medium') {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
        Low
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const stat = status.toLowerCase();
    if (stat === 'open') {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-2 py-0.5 text-xs font-semibold uppercase">
          Open
        </span>
      );
    }
    if (stat === 'investigating') {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 text-xs font-semibold uppercase">
          Investigating
        </span>
      );
    }
    if (stat === 'resolved') {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 text-xs font-semibold uppercase">
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-semibold uppercase">
        False Positive
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Platform Fraud Alerts</h1>
      </div>

      {/* Filter panel */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
              <FontAwesomeIcon icon={faFilter} className="h-3.5 w-3.5" />
              Filter By:
            </div>

            <div className="flex flex-1 flex-wrap gap-3">
              {/* Tenant filter */}
              <div className="w-full sm:w-48">
                <select
                  value={selectedTenant}
                  onChange={(e) => setSelectedTenant(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">All Organizations</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="w-full sm:w-40">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
            </div>

            {isFetching && (
              <div className="flex items-center text-xs text-muted-foreground">
                <FontAwesomeIcon icon={faSpinner} className="mr-1.5 h-3 w-3 animate-spin text-primary" />
                Updating...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Alerts List */}
      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>Security Risks & Fraud Flags ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted/65" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faShield} className="mx-auto h-8 w-8 text-emerald-600/50" />
              <p className="mt-2 text-sm text-muted-foreground font-medium text-emerald-700 dark:text-emerald-500">No security alerts triggered.</p>
              <p className="text-xs text-muted-foreground">The platform is running smoothly and all operations are secured.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Triggered Rule</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(alert.createdAt)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getSeverityBadge(alert.severity)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {alert.tenant?.name || 'Platform'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-foreground">
                        {alert.rule.replace(/_/g, ' ')}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="font-medium text-foreground">{alert.resourceType || 'N/A'}</span>
                        <span className="block text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
                          {alert.resourceId || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground max-w-xs">
                        {alert.details ? (
                          <div className="max-h-16 overflow-y-auto font-mono text-[10px] leading-tight bg-muted/20 p-1.5 rounded border border-border/40">
                            {JSON.stringify(alert.details, null, 2)}
                          </div>
                        ) : (
                          'No details provided'
                        )}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {getStatusBadge(alert.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
