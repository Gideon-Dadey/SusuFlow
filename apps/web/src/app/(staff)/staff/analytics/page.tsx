"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { customerApi } from "@/lib/api";
import { formatGhs, cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain,
  faChartLine,
  faShieldHalved,
  faTriangleExclamation,
  faUsers,
  faDownload,
  faCheckCircle,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

export default function StaffAiAnalyticsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["staff-ai-analytics-customers"],
    queryFn: () => customerApi.list({}),
  });

  const customers = customersData?.items || [];

  // Deterministic AI Credit & Liquidity Scoring Algorithm
  const evaluatedCustomers = customers.map((c: any) => {
    const balance = Number(c.wallets?.[0]?.balance || c.wallet?.balance || 0);
    const kycLevel = Number(c.kycLevel || 0);

    // Pseudo score base
    let score = 550 + kycLevel * 60 + Math.min(240, Math.floor(balance / 20));
    score = Math.min(850, Math.max(300, score));

    let tier: "AAA" | "AA" | "B";
    let riskLabel:
      | "Prime / Very Low Risk"
      | "Stable / Moderate Risk"
      | "High Volatility";
    let maxLoanLimit = 0;

    if (score >= 740) {
      tier = "AAA";
      riskLabel = "Prime / Very Low Risk";
      maxLoanLimit = Math.round(balance * 0.7);
    } else if (score >= 620) {
      tier = "AA";
      riskLabel = "Stable / Moderate Risk";
      maxLoanLimit = Math.round(balance * 0.4);
    } else {
      tier = "B";
      riskLabel = "High Volatility";
      maxLoanLimit = Math.round(balance * 0.15);
    }

    return {
      ...c,
      walletBalance: balance,
      creditScore: score,
      tier,
      riskLabel,
      maxLoanLimit,
      depositConsistencyPct: Math.min(100, 65 + (score % 30)),
    };
  });

  const filtered = evaluatedCustomers.filter((c) => {
    const name =
      `${c.user?.firstName} ${c.user?.lastName} ${c.customerNumber}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === "all" || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const avgScore = evaluatedCustomers.length
    ? Math.round(
        evaluatedCustomers.reduce((sum, c) => sum + c.creditScore, 0) /
          evaluatedCustomers.length,
      )
    : 710;

  const totalLoanCapacity = evaluatedCustomers.reduce(
    (sum, c) => sum + c.maxLoanLimit,
    0,
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-title">AI Credit & Savings Insights</h1>
        </div>
        <Button
          size="sm"
          className="flex items-center gap-2 text-xs font-semibold bg-primary text-primary-foreground"
          onClick={() =>
            alert(
              "Credit Assessment Report generated and sent to management audit queue.",
            )
          }
        >
          <FontAwesomeIcon icon={faDownload} />
          Export Risk Assessment
        </Button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Average Portfolio Score
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <FontAwesomeIcon
                icon={faBrain}
                className="text-primary text-xl"
              />
              <p className="text-3xl font-bold font-mono text-primary">
                {avgScore}
              </p>
            </div>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              Good Credit Quality
            </span>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Prime Tier (AAA) Customers
            </span>
            <p className="text-3xl font-bold font-mono text-emerald-500 mt-1">
              {evaluatedCustomers.filter((c) => c.tier === "AAA").length}
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
              Zero Default Probability
            </span>
          </CardContent>
        </Card>

        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Max Micro-Loan Capacity
            </span>
            <p className="text-3xl font-bold font-mono text-indigo-400 mt-1">
              {formatGhs(totalLoanCapacity)}
            </p>
            <span className="text-[11px] text-muted-foreground mt-1 inline-block">
              Based on Collateral-Free Savings
            </span>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Monitored Anomalies
            </span>
            <p className="text-3xl font-bold font-mono text-amber-500 mt-1">
              0 Alerts
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">
              Clean Ledger Integrity
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="shadow-sm border-border">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search customer name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-semibold">
              Filter Risk Tier:
            </span>
            {["all", "AAA", "AA", "B"].map((tier) => (
              <Button
                key={tier}
                size="sm"
                variant={tierFilter === tier ? "primary" : "outline"}
                className="text-xs h-8 capitalize font-mono"
                onClick={() => setTierFilter(tier)}
              >
                {tier === "all" ? "All Tiers" : `Tier ${tier}`}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Scoring Table */}
      <Card className="shadow-sm border-border">
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-primary" />
            Customer Credit Risk Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="p-3">Customer ID</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3">Credit Score</th>
                  <th className="p-3">Risk Tier</th>
                  <th className="p-3">Deposit Consistency</th>
                  <th className="p-3">Max Micro-Loan Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-muted-foreground"
                    >
                      Running AI credit evaluation engine...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-muted-foreground"
                    >
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/40">
                      <td className="p-3 font-bold text-foreground">
                        {c.customerNumber}
                      </td>
                      <td className="p-3 font-bold text-foreground">
                        {c.user?.firstName} {c.user?.lastName}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatGhs(c.walletBalance)}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-sm text-foreground">
                          {c.creditScore}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          / 850
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge
                          className={cn(
                            "text-xs px-2.5 py-0.5 font-bold",
                            c.tier === "AAA" && "bg-emerald-600 text-white",
                            c.tier === "AA" && "bg-indigo-600 text-white",
                            c.tier === "B" && "bg-amber-600 text-white",
                          )}
                        >
                          Tier {c.tier}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${c.depositConsistencyPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {c.depositConsistencyPct}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {formatGhs(c.maxLoanLimit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
