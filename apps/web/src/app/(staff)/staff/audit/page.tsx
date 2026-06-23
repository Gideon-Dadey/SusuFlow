'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auditApi } from '@/lib/api';

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['staff-audit-logs', actionFilter, resourceTypeFilter],
    queryFn: () =>
      auditApi.list({
        action: actionFilter || undefined,
        resourceType: resourceTypeFilter || undefined,
        limit: 50,
      }),
  });

  const logs = data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">Security & Operations Audit Logs</h1>
      </div>

      {/* Filters */}
      <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Filter by Action</label>
              <Input
                type="text"
                placeholder="e.g. user:login or customer:create"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Filter by Resource Type</label>
              <Input
                type="text"
                placeholder="e.g. customer or transaction"
                value={resourceTypeFilter}
                onChange={(e) => setResourceTypeFilter(e.target.value)}
                className="min-h-[44px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-card/60 backdrop-blur-md border border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold text-foreground">Activity Ledger</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No matching audit records found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const userName = log.user
                      ? `${log.user.firstName} ${log.user.lastName}`
                      : 'System / Guest';
                    const userEmail = log.user?.email ? ` (${log.user.email})` : '';

                    return (
                      <tr key={log.id} className="hover:bg-muted/10">
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4 text-xs font-medium text-foreground">
                          {userName}
                          <span className="block text-[10px] text-muted-foreground font-normal">
                            {userEmail}
                          </span>
                        </td>
                        <td className="p-4 text-xs">
                          <span className="font-semibold text-primary">{log.action}</span>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{log.resourceType}</span>
                          {log.resourceId && (
                            <span className="block text-[10px] font-mono text-muted-foreground/80 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                              {log.resourceId}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs font-mono text-muted-foreground">
                          {log.ipAddress || 'Unknown'}
                        </td>
                        <td className="p-4 text-xs text-muted-foreground max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {log.userAgent || 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
