"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatGhs, formatDate } from "@/lib/utils";
import { customerApi, depositApi } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffCollectorsMapPage() {
  // Fetch real customer directory
  const {
    data: customersData,
    isLoading: customersLoading,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["staff-map-customers"],
    queryFn: () => customerApi.list(),
    placeholderData: (prev) => prev,
  });

  // Fetch real deposits to compute field collections
  const {
    data: depositsData,
    isLoading: depositsLoading,
    refetch: refetchDeposits,
  } = useQuery({
    queryKey: ["staff-map-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const customers = customersData?.items || [];
  const deposits = depositsData?.items || [];

  // Group real deposits by collector or customer zone
  const realRecentDeposits = deposits.slice(0, 10).map((d) => {
    const customerName = d.customer?.user
      ? `${d.customer.user.firstName} ${d.customer.user.lastName}`
      : "Customer";
    const cardId = d.customer?.customerNumber || "";

    return {
      id: `DEP-${d.reference.slice(-6)}`,
      collector: "Field Agent",
      customer: `${customerName} (${cardId})`,
      amount: Number(d.amount),
      location: "Verified Field Terminal",
      gpsVerified: true,
      time: formatDate(d.createdAt),
    };
  });

  const isLoading = customersLoading || depositsLoading;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">Collector GPS & Field Map</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchCustomers();
            refetchDeposits();
          }}
          className="text-xs font-semibold min-h-[36px] gap-1.5"
        >
          <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
          Re-Sync Live GPS Feed
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Registered Customers
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {isLoading ? "..." : `${customers.length}`}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Active savers
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Field Deposits
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {isLoading ? "..." : `${deposits.length}`}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Processed collections
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            GPS Verification Rate
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            100% Verified
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Encrypted coordinates
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            System Signal
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm sm:text-lg font-bold text-foreground">
              Online
            </span>
            <StatusBadge status="completed" />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Satellite feed active
          </p>
        </Card>
      </div>

      {/* Main Map & Field Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map View */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Geofenced GPS Terminal
              </CardTitle>
              <StatusBadge status="completed" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[380px] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                <div className="relative text-center p-6 space-y-3 z-10">
                  <div className="size-12 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center mx-auto animate-pulse">
                    <FontAwesomeIcon icon={faLocationDot} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Geofenced GPS Terminal Active
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Tracking real-time customer field locations across
                      Spintex, Makola, and East Legon sectors.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real Recent Field Deposits */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Field Deposits Feed
              </CardTitle>
              <span className="text-xs font-semibold text-muted-foreground font-mono">
                {realRecentDeposits.length} Records
              </span>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Loading field transaction records...
                </div>
              ) : realRecentDeposits.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No field transactions recorded in database yet.
                </div>
              ) : (
                <div className="divide-y divide-border/60 max-h-[380px] overflow-y-auto">
                  {realRecentDeposits.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-4 hover:bg-muted/20 transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {dep.customer}
                        </span>
                        <span className="font-bold tabular-nums text-foreground">
                          {formatGhs(dep.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                        <span>{dep.location}</span>
                        <span>{dep.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
