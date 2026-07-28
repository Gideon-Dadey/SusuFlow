"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGhs, cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapLocationDot,
  faRoute,
  faLocationDot,
  faCheckCircle,
  faSatellite,
  faUserTie,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffCollectorsMapPage() {
  const [selectedCollector, setSelectedCollector] = useState<string | null>(
    null,
  );

  const collectors = [
    {
      id: "COL-101",
      name: "Nana Kwame",
      zone: "Makola Market - Sector A",
      coords: "5.5502° N, 0.2032° W",
      status: "Verified On-Site",
      todayCollection: 4250.0,
      custVisited: 28,
      totalAssigned: 35,
      battery: 92,
      lastSync: "2 mins ago",
    },
    {
      id: "COL-102",
      name: "Abena Mansa",
      zone: "Madina Market - Zongo Lane",
      coords: "5.6681° N, 0.1672° W",
      status: "Verified On-Site",
      todayCollection: 3100.0,
      custVisited: 22,
      totalAssigned: 30,
      battery: 85,
      lastSync: " Just now",
    },
    {
      id: "COL-103",
      name: "Kofi Boateng",
      zone: "Kaneshie Market Complex",
      coords: "5.5670° N, 0.2311° W",
      status: "In Transit",
      todayCollection: 1850.0,
      custVisited: 14,
      totalAssigned: 25,
      battery: 64,
      lastSync: "8 mins ago",
    },
  ];

  const recentFieldDeposits = [
    {
      id: "DEP-891",
      collector: "Nana Kwame",
      customer: "Ruiping Ding (WLQDQ6WL)",
      amount: 1000.0,
      location: "Makola Stall #42",
      gpsVerified: true,
      time: "9:51 PM",
    },
    {
      id: "DEP-890",
      collector: "Abena Mansa",
      customer: "Kwame Mensah (7X9K2M4W)",
      amount: 500.0,
      location: "Madina Zongo Block B",
      gpsVerified: true,
      time: "8:15 PM",
    },
    {
      id: "DEP-889",
      collector: "Kofi Boateng",
      customer: "Ama Serwaa (9X3A7K5P)",
      amount: 750.0,
      location: "Kaneshie Line 3",
      gpsVerified: true,
      time: "7:40 PM",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">
            Collector Live GPS & Geofenced Map
          </h1>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2 text-xs font-semibold"
          onClick={() =>
            alert("GPS Field Geofence Ping refreshed successfully.")
          }
        >
          <FontAwesomeIcon icon={faRefresh} />
          Refresh Pings
        </Button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Active Field Agents
            </span>
            <p className="text-3xl font-bold font-mono text-primary mt-1">
              3 Online
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              GPS Telemetry Active
            </span>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Today's Field Collection
            </span>
            <p className="text-3xl font-bold font-mono text-emerald-500 mt-1">
              {formatGhs(9200.0)}
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
              Across 64 Customers
            </span>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Geofence Accuracy
            </span>
            <p className="text-3xl font-bold font-mono text-indigo-400 mt-1">
              100%
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              Strict Site Match (&lt;15m)
            </span>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Route Efficiency
            </span>
            <p className="text-3xl font-bold font-mono text-amber-500 mt-1">
              94.2%
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
              Optimal Path Covered
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Simulated Map Box */}
        <Card className="lg:col-span-2 shadow-sm border-border overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faMapLocationDot}
                  className="text-primary"
                />
                Live Satellite Field Operations Grid
              </CardTitle>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">
                Live GPS Telemetry
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Visual Simulated Map Interface */}
            <div className="relative w-full h-[380px] bg-slate-950 p-6 flex flex-col justify-between overflow-hidden border-b border-border">
              {/* Map grid lines background styling */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              {/* Simulated Map Markers */}
              <div className="relative z-10 flex flex-wrap gap-4 items-center justify-around h-full">
                {collectors.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCollector(c.id)}
                    className={cn(
                      "p-3 rounded-xl border bg-slate-900/90 backdrop-blur cursor-pointer transition-all hover:scale-105 shadow-xl max-w-[220px]",
                      selectedCollector === c.id
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-xs text-white">
                        {c.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {c.zone}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                      <span>{formatGhs(c.todayCollection)}</span>
                      <span>
                        {c.custVisited}/{c.totalAssigned} Visited
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-muted-foreground bg-slate-900/80 p-2 rounded-lg border border-border">
                <span>Center: Greater Accra Metropolitan Area</span>
                <span>Signal: 4G LTE / GPS Lock</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collector Roster */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FontAwesomeIcon icon={faUserTie} className="text-primary" />
              Active Collector Roster
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {collectors.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">
                    {c.name} ({c.id})
                  </span>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                    {c.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.zone}</p>
                <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Coordinates:</span>
                  <span className="text-primary font-semibold">{c.coords}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Verified Field Deposit Stream */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-emerald-500"
            />
            Live Geofence-Verified Field Deposit Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Field Collector</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Deposit Amount</th>
                  <th className="p-3">Field Location</th>
                  <th className="p-3">GPS Verification</th>
                  <th className="p-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {recentFieldDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-muted/40">
                    <td className="p-3 font-bold text-foreground">{dep.id}</td>
                    <td className="p-3 font-semibold text-primary">
                      {dep.collector}
                    </td>
                    <td className="p-3 text-foreground font-bold">
                      {dep.customer}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      +{formatGhs(dep.amount)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {dep.location}
                    </td>
                    <td className="p-3">
                      <Badge className="bg-emerald-600 text-white font-mono text-[10px]">
                        Verified On-Site (&lt;10m)
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{dep.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
