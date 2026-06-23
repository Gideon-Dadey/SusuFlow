'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { fraudApi } from '@/lib/api';

export default function FraudAlertsPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('open');
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['fraud-alerts', selectedStatus],
    queryFn: () => fraudApi.list(selectedStatus || undefined),
  });

  const resolveMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: 'resolved' | 'false_positive';
      notes?: string;
    }) => fraudApi.resolve(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
      setActiveAlertId(null);
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : 'Alert resolution failed');
    },
  });

  const handleResolve = async (id: string, status: 'resolved' | 'false_positive') => {
    const notes = resolutionNotes[id];
    setActiveAlertId(id);
    await resolveMutation.mutateAsync({ id, status, notes });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">Fraud & Risk Alerts</h1>
        </div>

        <div className="flex items-center gap-2">
          {['open', 'investigating', 'resolved', ''].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={selectedStatus === status ? 'primary' : 'outline'}
              onClick={() => setSelectedStatus(status)}
              className="text-xs font-semibold px-3 min-h-[36px]"
            >
              {status === '' ? 'All' : status.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <Card key={n} className="animate-pulse p-6">
              <div className="h-6 bg-muted w-1/4 rounded mb-4" />
              <div className="h-4 bg-muted w-3/4 rounded mb-2" />
              <div className="h-4 bg-muted w-1/2 rounded" />
            </Card>
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-dashed">
          <p className="text-muted-foreground text-sm">No risk alerts found matching filter</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className="bg-card/60 backdrop-blur-md border border-border shadow-sm overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 border-b border-border bg-card/45">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()} RISK
                    </span>
                    <StatusBadge status={alert.status} />
                    <span className="text-xs text-muted-foreground font-mono">
                      Rule ID: {alert.rule}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Suspected Action detected in Tenant system
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Triggered: {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded max-w-sm overflow-auto">
                  Resource: {alert.resourceType || 'None'} / {alert.resourceId || 'N/A'}
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div className="text-sm">
                  <strong className="text-foreground">Details Payload:</strong>
                  <pre className="mt-2 p-3 bg-muted/65 dark:bg-muted/30 rounded text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(alert.details, null, 2)}
                  </pre>
                </div>

                {alert.status === 'resolved' && alert.resolvedBy && (
                  <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 text-sm">
                    <strong>Resolution Status:</strong> Resolved by {alert.resolvedBy.firstName} {alert.resolvedBy.lastName} on {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : 'N/A'}
                    {alert.details?.resolutionNotes && (
                      <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                        Notes: {alert.details.resolutionNotes}
                      </p>
                    )}
                  </div>
                )}

                {alert.status === 'open' && (
                  <div className="pt-4 border-t border-border space-y-3">
                    <div className="flex flex-col md:flex-row gap-3">
                      <Input
                        placeholder="Add resolution notes..."
                        value={resolutionNotes[alert.id] || ''}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({ ...prev, [alert.id]: e.target.value }))
                        }
                        className="text-sm min-h-[44px] flex-1"
                      />
                      <div className="flex gap-2 min-h-[44px]">
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={activeAlertId === alert.id && resolveMutation.isPending}
                          onClick={() => handleResolve(alert.id, 'false_positive')}
                          className="text-xs font-semibold px-4"
                        >
                          False Positive
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={activeAlertId === alert.id && resolveMutation.isPending}
                          onClick={() => handleResolve(alert.id, 'resolved')}
                          className="text-xs font-semibold px-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                        >
                          Resolve Alert
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
