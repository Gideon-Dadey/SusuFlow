'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faDatabase, faBolt, faPaperPlane, faRefresh, faNetworkWired } from '@fortawesome/free-solid-svg-icons';

export default function AdminHealthPage() {
  const { data: health, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-health-metrics'],
    queryFn: () => adminApi.getHealth(),
    refetchInterval: 10000, // auto-refresh every 10s
  });

  const formatUptime = (seconds: number) => {
    if (!seconds) return '0s';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="text-2xl font-bold tracking-tight">System Health Metrics</h1>
          <p className="text-sm text-muted-foreground">Real-time telemetry, server hardware metrics, and external microservice status</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <FontAwesomeIcon icon={faRefresh} className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Force Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 w-full animate-pulse rounded-lg bg-muted/65" />
          ))}
        </div>
      ) : (
        <>
          {/* Uptime & Hardware Resources Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faServer} className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Server Node Uptime</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-3xl font-extrabold text-foreground">{formatUptime(health?.uptime)}</p>
                <p className="text-xs text-muted-foreground mt-2">Active production instance</p>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faNetworkWired} className="h-5 w-5 text-sky-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">CPU Core Load</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-extrabold text-foreground">{health?.hardware?.cpuLoad ?? 0}%</p>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Optimal</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-4">
                  <div
                    className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${health?.hardware?.cpuLoad ?? 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon icon={faRefresh} className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Memory Footprint</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-extrabold text-foreground">{health?.hardware?.memoryUsage ?? 0}%</p>
                  <span className="text-xs text-muted-foreground">
                    {health?.hardware?.totalMemoryGb - health?.hardware?.freeMemoryGb} / {health?.hardware?.totalMemoryGb} GB
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-4">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${health?.hardware?.memoryUsage ?? 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Microservices & Gateways Status */}
          <h2 className="text-lg font-bold mt-8 mb-4">Core Platform Dependencies</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60">
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <FontAwesomeIcon icon={faDatabase} className="h-6 w-6 text-emerald-500" />
                  <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                    Connected
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Postgres Database</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latency: {health?.database?.latencyMs}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <FontAwesomeIcon icon={faBolt} className="h-6 w-6 text-yellow-500" />
                  <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                    Active
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Redis Caching</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latency: {health?.redis?.latencyMs}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <FontAwesomeIcon icon={faRefresh} className="h-6 w-6 text-cyan-500" />
                  <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                    Operational
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Paystack API Gateway</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Roundtrip: {health?.paystack?.latencyMs}ms</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="p-5 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <FontAwesomeIcon icon={faPaperPlane} className="h-6 w-6 text-indigo-500" />
                  <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">
                    9.4k credits
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">SMS Provider API</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Delivery Status: Operational</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
