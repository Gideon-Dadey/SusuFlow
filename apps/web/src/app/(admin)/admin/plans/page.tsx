"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatGhs } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPiggyBank,
  faUsers,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function AdminPlansPage() {
  const { data: plansData, isLoading } = useQuery({
    queryKey: ["admin-global-plans"],
    queryFn: () => adminApi.getPlans(),
  });

  const plans = plansData?.plans ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="dashboard-title">Savings Goals & Products</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Global directory of Susu savings plan templates, frequency limits, and
          saver enrollments.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 w-full animate-pulse rounded-none bg-muted/60" />
          <div className="h-64 w-full animate-pulse rounded-none bg-muted/60" />
        </div>
      ) : (
        <>
          {/* Plan stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="rounded-none border border-border/60 bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon
                  icon={faPiggyBank}
                  className="h-4 w-4 text-indigo-500"
                />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Savings Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {plansData?.activeCount ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Available goal classes
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-none border border-border/60 bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="h-4 w-4 text-sky-500"
                />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {plansData?.totalEnrollments ?? 0}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Savers enrolled in goals
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-none border border-border/60 bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="h-4 w-4 text-emerald-500"
                />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Global Savings Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {plans.length}
                </p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Susu plans configured globally
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Plans table */}
          <Card className="rounded-none border border-border/60 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm sm:text-base font-bold">
                Global Savings Plans Directory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No savings plans created.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase bg-muted/20">
                        <th className="py-3 px-4">Plan Name</th>
                        <th className="py-3 px-4">Frequency</th>
                        <th className="py-3 px-4">Organization</th>
                        <th className="py-3 px-4 text-right">Min Target</th>
                        <th className="py-3 px-4 text-right">Max Target</th>
                        <th className="py-3 px-4 text-right">Enrollments</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {plans.map((plan: any) => (
                        <tr
                          key={plan.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-bold text-foreground">
                            {plan.name}
                            {plan.description && (
                              <span className="block text-xs text-muted-foreground truncate max-w-xs font-normal">
                                {plan.description}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs capitalize text-foreground whitespace-nowrap">
                            {plan.frequency}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-muted-foreground">
                            <span className="inline-block rounded-none bg-muted px-2 py-0.5 text-xs font-medium text-foreground border border-border/60">
                              {plan.tenant?.name || "Global"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs font-mono text-muted-foreground">
                            {formatGhs(plan.minAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs font-mono text-muted-foreground">
                            {plan.maxAmount
                              ? formatGhs(plan.maxAmount)
                              : "Unlimited"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
                            {plan._count?.customerPlans ?? 0}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <StatusBadge status={plan.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
