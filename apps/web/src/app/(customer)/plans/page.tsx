"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { planApi, SavingsPlan, CustomerPlanWithProgress } from "@/lib/api";
import {
  Check,
  Target,
  TrendingUp,
  Sparkles,
  Plus,
  Calculator,
  ArrowRight,
} from "@/components/icons/phosphor";
import { formatGhs } from "@/lib/utils";

export default function SavingsPlansPage() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Calculator State
  const [calcAmount, setCalcAmount] = useState("10");
  const [calcFrequency, setCalcFrequency] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [calcMonths, setCalcMonths] = useState("3");

  // Fetch available plans
  const { data: plans = [] } = useQuery<SavingsPlan[]>({
    queryKey: ["plans-list"],
    queryFn: () => planApi.listPlans(),
  });

  // Fetch customer active enrollments
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<
    CustomerPlanWithProgress[]
  >({
    queryKey: ["my-enrollments"],
    queryFn: () => planApi.listEnrollments(),
  });

  // Check if enrolled
  const enrolledPlanIds = new Set(enrollments.map((e) => e.planId));

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setEnrollLoading(true);
    setEnrollError("");
    try {
      const amtVal = targetAmount ? parseFloat(targetAmount) : undefined;
      if (amtVal && amtVal < Number(selectedPlan.minAmount)) {
        throw new Error(
          `Minimum target amount is GHS ${selectedPlan.minAmount}`,
        );
      }

      await planApi.enroll({
        planId: selectedPlan.id,
        targetAmount: amtVal,
      });

      setSelectedPlan(null);
      setTargetAmount("");
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrollLoading(false);
    }
  };

  // Calculator Projections logic
  const calculateProjection = () => {
    const amt = parseFloat(calcAmount) || 0;
    const months = parseInt(calcMonths) || 3;

    // Average days/weeks per month
    let periods = 0;
    if (calcFrequency === "daily") {
      periods = months * 30; // 30 days
    } else if (calcFrequency === "weekly") {
      periods = months * 4.34; // 4.34 weeks
    } else {
      periods = months; // monthly
    }

    const projected = amt * periods;
    return Math.round(projected);
  };

  const projectedTotal = calculateProjection();

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="dashboard-title">Goals & Plans</h1>
      </div>

      {/* Active Goals Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          My Active Goals
        </h2>
        {isLoadingEnrollments ? (
          <div className="h-28 rounded-xl bg-card border border-border animate-pulse" />
        ) : enrollments.length === 0 ? (
          <Card className="border border-border bg-card">
            <CardContent className="p-8 text-center text-muted-foreground text-sm space-y-2">
              <p>You have not enrolled in any savings goal yet.</p>
              <p className="text-xs text-muted-foreground/80">
                Choose an available susu plan below to begin your savings
                journey.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments.map((e) => {
              const targetVal = Number(e.targetAmount || 0);
              return (
                <Card
                  key={e.id}
                  className="border border-border bg-card hover:shadow-card transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base text-foreground font-semibold flex items-center gap-1.5">
                          <Target className="h-4 w-4 text-primary shrink-0" />
                          {e.plan.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground pt-1">
                          {e.plan.description}
                        </p>
                      </div>
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                        {e.plan.frequency}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress details */}
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-muted-foreground">Saved</span>
                        <p className="text-lg font-bold text-foreground">
                          {formatGhs(e.savedAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground">Target</span>
                        <p className="text-sm font-semibold text-muted-foreground/80">
                          {formatGhs(targetVal)}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${e.progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{e.progressPercent}% Completed</span>
                        {e.savedAmount >= targetVal ? (
                          <span className="text-green-500 font-semibold flex items-center gap-0.5">
                            Goal Achieved <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span>
                            Remaining:{" "}
                            {formatGhs(Math.max(0, targetVal - e.savedAmount))}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Projection Calculator */}
      <Card className="border border-border bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Calculator className="h-32 w-32 text-primary" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            Susu Projection Calculator
          </CardTitle>
          <p className="text-xs text-muted-foreground pt-1">
            Estimate how much your daily habits will grow over time
          </p>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Save Amount (GHS)
              </label>
              <Input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="text-foreground border-border bg-background h-9 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Frequency
              </label>
              <select
                value={calcFrequency}
                onChange={(e) => setCalcFrequency(e.target.value as any)}
                className="w-full h-9 rounded-md border border-border bg-background text-xs px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Duration
              </label>
              <select
                value={calcMonths}
                onChange={(e) => setCalcMonths(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background text-xs px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
                <option value="12">12 Months</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-primary/20 bg-primary-100/10 p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Estimated Total Savings
              </p>
              <p className="text-2xl font-black text-primary">
                {formatGhs(projectedTotal)}
              </p>
            </div>
            <div className="text-xs text-muted-foreground text-center sm:text-right max-w-xs">
              <span className="font-semibold text-foreground">
                Goal Projection:
              </span>{" "}
              Save{" "}
              <span className="text-primary font-bold">GHS {calcAmount}</span>{" "}
              {calcFrequency} for {calcMonths} months and achieve your target!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Available Susu Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((p) => {
            const isEnrolled = enrolledPlanIds.has(p.id);
            return (
              <Card
                key={p.id}
                className="border border-border bg-card flex flex-col justify-between hover:border-secondary/40 transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-sm text-foreground font-semibold flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-secondary shrink-0" />
                      {p.name}
                    </CardTitle>
                    <span className="text-[10px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                      {p.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    {p.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-2 space-y-4">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Minimum Deposit</span>
                      <span className="font-medium text-foreground">
                        {formatGhs(Number(p.minAmount))}
                      </span>
                    </div>
                    {p.durationMonths && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span className="font-medium text-foreground">
                          {p.durationMonths} Months
                        </span>
                      </div>
                    )}
                  </div>
                  {isEnrolled ? (
                    <Button
                      disabled
                      className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-90"
                    >
                      Enrolled <Check className="ml-1.5 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setSelectedPlan(p)}
                    >
                      Start Goal <Plus className="ml-1.5 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Enroll Modal Dialog */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm border border-border bg-card relative shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base text-foreground font-bold flex items-center gap-1.5">
                <Target className="h-5 w-5 text-primary" />
                Enroll in {selectedPlan.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground pt-1">
                Set a target savings goal for this plan. Min deposit:{" "}
                {formatGhs(Number(selectedPlan.minAmount))}.
              </p>
            </CardHeader>
            <form onSubmit={handleEnroll}>
              <CardContent className="space-y-4">
                <Input
                  label="Target Savings Amount (GHS)"
                  type="number"
                  placeholder="500.00"
                  min={Number(selectedPlan.minAmount)}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="text-foreground border-border bg-background"
                  required
                />
                {enrollError ? (
                  <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                    {enrollError}
                  </p>
                ) : null}
              </CardContent>
              <div className="flex border-t border-border p-4 gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPlan(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" loading={enrollLoading}>
                  Join Goal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
