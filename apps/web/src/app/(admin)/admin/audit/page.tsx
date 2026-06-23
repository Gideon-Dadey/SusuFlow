'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListUl, faFilter, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function AdminAuditLogsPage() {
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  // Fetch tenants for filtering dropdown
  const { data: tenantsData } = useQuery({
    queryKey: ['admin-tenants-list'],
    queryFn: () => adminApi.listTenants(),
  });

  // Fetch global audit logs
  const { data: auditData, isLoading, isFetching } = useQuery({
    queryKey: ['admin-global-audit', selectedTenant],
    queryFn: () =>
      adminApi.listAuditLogs({
        tenant_id: selectedTenant || undefined,
      }),
  });

  const tenants = tenantsData?.items ?? [];
  const logs = auditData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">System Audit Trail</h1>
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
              <div className="w-full sm:w-64">
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

      {/* Main Audit Logs Card */}
      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>Global Activity Logs ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted/65" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faListUl} className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No audit logs found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Action</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Resource Target</th>
                    <th className="py-3 px-4">Connection Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground capitalize whitespace-nowrap">
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {log.tenant?.name || 'Platform'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {log.user ? (
                          <>
                            <span className="font-medium text-foreground">
                              {log.user.firstName} {log.user.lastName}
                            </span>
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              {log.user.email}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">System / Webhook</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className="font-semibold text-foreground capitalize">
                          {log.resourceType.toLowerCase()}
                        </span>
                        {log.resourceId && (
                          <span className="block text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">
                            {log.resourceId}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {log.ipAddress && (
                          <div className="font-mono text-[10px]">
                            IP: <span className="text-foreground">{log.ipAddress}</span>
                          </div>
                        )}
                        {log.userAgent && (
                          <div className="max-w-[150px] truncate text-[9px]" title={log.userAgent}>
                            UA: {log.userAgent}
                          </div>
                        )}
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
