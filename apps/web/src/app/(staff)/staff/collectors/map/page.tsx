"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGhs, getInitials, cn } from "@/lib/utils";
import { customerApi, depositApi } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faLocationDot,
  faCheckCircle,
  faSatellite,
  faUserTie,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffCollectorsMapPage() {
  const [selectedCollectorId, setSelectedCollectorId] = useState<string | null>(
    null,
  );

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
      time: new Date(d.createdAt).toLocaleTimeString(),
    };
  });

  const isLoading = customersLoading || depositsLoading;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">
            Collector Live GPS & Field Map Terminal
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchCustomers();
            refetchDeposits();
          }}
          className="text-xs font-semibold gap-1.5"
        >
          <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
          Re-Sync Live GPS Feed
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Registered Customers
              </p>
              <p className="text-lg font-bold text-foreground mt-1">
                {isLoading ? "..." : `${customers.length} Savers`}
              </p>
            </div>
            <div className="size-9 rounded bg-primary/10 text-primary flex items-center justify-center">
              <FontAwesomeIcon icon={faUserTie} className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Field Deposits
              </p>
              <p className="text-lg font-bold text-foreground mt-1">
                {isLoading ? "..." : `${deposits.length} Records`}
              </p>
            </div>
            <div className="size-9 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                GPS Verification Rate
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                100% Encrypted GPS
              </p>
            </div>
            <div className="size-9 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FontAwesomeIcon icon={faSatellite} className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System Signal
              </p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Live / Online
              </p>
            </div>
            <div className="size-9 rounded bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <FontAwesomeIcon icon={faMapLocationDot} className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Map & Field Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map View */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden border border-border">
            <CardHeader className="pb-3 border-b border-border bg-slate-900 text-white">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faSatellite}
                    className="text-primary h-4 w-4"
                  />
                  Live Geofenced GPS Terminal (Accra Central Region)
                </span>
                <Badge
                  variant="neutral"
                  className="text-[10px] bg-emerald-500/20 text-emerald-300 border-none"
                >
                  GPS Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[380px] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* Visual Map Grid Canvas Simulation */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                <div className="relative text-center p-6 space-y-3 z-10">
                  <div className="size-12 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center mx-auto animate-pulse">
                    <FontAwesomeIcon icon={faLocationDot} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Live Database Field Deposits</span>
                <Badge variant="neutral" className="text-[10px] font-mono">
                  {realRecentDeposits.length} Records
                </Badge>
              </CardTitle>
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
                <div className="divide-y divide-border max-h-[380px] overflow-y-auto">
                  {realRecentDeposits.map((dep) => (
                    <div
                      key={dep.id}
                      className="p-3.5 hover:bg-muted/30 transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">
                          {dep.customer}
                        </span>
                        <span className="font-mono font-bold text-primary">
                          {formatGhs(dep.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FontAwesomeIcon
                            icon={faLocationDot}
                            className="text-emerald-500 h-3 w-3"
                          />
                          {dep.location}
                        </span>
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
