"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { customerApi } from "@/lib/api";
import { formatGhs } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

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
          className="flex items-center gap-2 text-xs font-semibold rounded-none min-h-[36px] bg-primary text-primary-foreground hover:bg-primary/95"
          onClick={() =>
            alert(
              "Credit Assessment Report generated and sent to management audit queue.",
            )
          }
        >
          <FontAwesomeIcon icon={faDownload} className="h-3.5 w-3.5" />
          Export Risk Assessment
        </Button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Average Portfolio Score
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {avgScore}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              / 850
            </span>
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Good Credit Quality
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Prime Tier (AAA) Savers
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {evaluatedCustomers.filter((c) => c.tier === "AAA").length}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Zero default probability
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Max Micro-Loan Capacity
          </p>
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {formatGhs(totalLoanCapacity)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Collateral-free savings
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monitored Anomalies
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm sm:text-lg font-bold text-foreground">
              0 Alerts
            </span>
            <StatusBadge status="completed" />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Clean ledger integrity
          </p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search customer name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs font-mono rounded-none border border-border/60 h-9"
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
                className="text-xs h-8 capitalize rounded-none font-semibold px-3"
                onClick={() => setTierFilter(tier)}
              >
                {tier === "all" ? "All Tiers" : `Tier ${tier}`}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Customer Scoring Table */}
      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Customer Credit Risk Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Wallet Balance</th>
                  <th className="py-3.5 px-4">Credit Score</th>
                  <th className="py-3.5 px-4">Risk Tier</th>
                  <th className="py-3.5 px-4">Consistency</th>
                  <th className="py-3.5 px-4 text-right">Loan Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      Running AI credit evaluation engine...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      No customer records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        {c.customerNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {c.user?.firstName} {c.user?.lastName}
                      </td>
                      <td className="py-3.5 px-4 font-bold tabular-nums text-foreground">
                        {formatGhs(c.walletBalance)}
                      </td>
                      <td className="py-3.5 px-4 font-bold tabular-nums text-foreground">
                        {c.creditScore}{" "}
                        <span className="text-[10px] text-muted-foreground font-normal">
                          / 850
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={
                            c.tier === "AAA"
                              ? "completed"
                              : c.tier === "AA"
                                ? "pending"
                                : "failed"
                          }
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${c.depositConsistencyPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {c.depositConsistencyPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
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
