"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staffPlanApi, type SavingsPlan } from "@/lib/api";
import { formatGhs, formatDate } from "@/lib/utils";
import { Plus, Pencil, X, Check } from "lucide-react";

type Tab = "plans" | "enrollments";

type PlanFormState = {
  name: string;
  description: string;
  frequency: SavingsPlan["frequency"];
  minAmount: string;
  maxAmount: string;
  durationMonths: string;
};

const emptyForm: PlanFormState = {
  name: "",
  description: "",
  frequency: "weekly",
  minAmount: "",
  maxAmount: "",
  durationMonths: "12",
};

function planToForm(plan: SavingsPlan): PlanFormState {
  return {
    name: plan.name,
    description: plan.description || "",
    frequency: plan.frequency,
    minAmount: String(plan.minAmount),
    maxAmount: plan.maxAmount != null ? String(plan.maxAmount) : "",
    durationMonths:
      plan.durationMonths != null ? String(plan.durationMonths) : "",
  };
}

export default function SavingsGoalsTrackerPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("plans");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SavingsPlan | null>(null);
  const [form, setForm] = useState<PlanFormState>(emptyForm);
  const [formError, setFormError] = useState("");

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["staff-plans"],
    queryFn: () => staffPlanApi.listAllPlans(),
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["staff-plans-enrollments"],
    queryFn: () => staffPlanApi.listAllEnrollments(),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingPlan(null);
    setShowForm(false);
    setFormError("");
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingPlan(null);
    setShowForm(true);
    setFormError("");
  };

  const openEdit = (plan: SavingsPlan) => {
    setForm(planToForm(plan));
    setEditingPlan(plan);
    setShowForm(true);
    setFormError("");
  };

  const createMutation = useMutation({
    mutationFn: () =>
      staffPlanApi.createPlan({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        frequency: form.frequency,
        minAmount: parseFloat(form.minAmount),
        maxAmount: form.maxAmount ? parseFloat(form.maxAmount) : undefined,
        durationMonths: form.durationMonths
          ? parseInt(form.durationMonths, 10)
          : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-plans"] });
      resetForm();
    },
    onError: (err) => {
      setFormError(
        err instanceof Error ? err.message : "Failed to create plan",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof staffPlanApi.updatePlan>[1]) =>
      staffPlanApi.updatePlan(editingPlan!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-plans"] });
      resetForm();
    },
    onError: (err) => {
      setFormError(
        err instanceof Error ? err.message : "Failed to update plan",
      );
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (plan: SavingsPlan) =>
      staffPlanApi.updatePlan(plan.id, {
        status: plan.status === "active" ? "inactive" : "active",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-plans"] });
    },
    onError: (err) => {
      alert(
        err instanceof Error ? err.message : "Failed to update plan status",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Plan name is required");
      return;
    }
    const minAmount = parseFloat(form.minAmount);
    if (!minAmount || minAmount <= 0) {
      setFormError("Enter a valid minimum amount");
      return;
    }
    const maxAmount = form.maxAmount ? parseFloat(form.maxAmount) : undefined;
    if (maxAmount !== undefined && maxAmount < minAmount) {
      setFormError("Maximum amount must be greater than or equal to minimum");
      return;
    }

    if (editingPlan) {
      updateMutation.mutate({
        name: form.name.trim(),
        description: form.description.trim(),
        frequency: form.frequency,
        minAmount,
        maxAmount,
        durationMonths: form.durationMonths
          ? parseInt(form.durationMonths, 10)
          : undefined,
      });
    } else {
      createMutation.mutate();
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const activePlans = plans?.filter((p) => p.status === "active").length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-title">Savings Goals</h1>
        </div>
        {activeTab === "plans" && !showForm && (
          <Button
            size="sm"
            onClick={openCreate}
            className="text-xs font-semibold px-4 min-h-[36px] rounded-none bg-primary text-primary-foreground hover:bg-primary/95 shrink-0 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Plan
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "plans"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Savings Plans ({plans?.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("enrollments")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "enrollments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Customer Enrollments ({enrollments?.length ?? 0})
        </button>
      </div>

      {activeTab === "plans" && (
        <>
          {showForm && (
            <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                  {editingPlan ? "Edit Savings Plan" : "Create Savings Plan"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  aria-label="Close form"
                  className="rounded-none h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Plan Name *
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Weekly Susu"
                      className="rounded-none border border-border/60 text-xs min-h-[38px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Description
                    </label>
                    <Input
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Optional description for customers"
                      className="rounded-none border border-border/60 text-xs min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Frequency *
                    </label>
                    <select
                      value={form.frequency}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          frequency: e.target.value as SavingsPlan["frequency"],
                        })
                      }
                      className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-xs text-foreground outline-none min-h-[38px]"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Duration (months)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={form.durationMonths}
                      onChange={(e) =>
                        setForm({ ...form, durationMonths: e.target.value })
                      }
                      placeholder="12"
                      className="rounded-none border border-border/60 text-xs min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Minimum Amount (GHS) *
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.minAmount}
                      onChange={(e) =>
                        setForm({ ...form, minAmount: e.target.value })
                      }
                      placeholder="10"
                      className="rounded-none border border-border/60 text-xs min-h-[38px]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Maximum Amount (GHS)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.maxAmount}
                      onChange={(e) =>
                        setForm({ ...form, maxAmount: e.target.value })
                      }
                      placeholder="Optional"
                      className="rounded-none border border-border/60 text-xs min-h-[38px]"
                    />
                  </div>
                  {formError && (
                    <p className="md:col-span-2 text-xs font-semibold text-red-500">
                      {formError}
                    </p>
                  )}
                  <div className="md:col-span-2 flex gap-2">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="gap-2 rounded-none min-h-[36px] text-xs font-semibold bg-primary text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                      {isSaving
                        ? "Saving..."
                        : editingPlan
                          ? "Save Changes"
                          : "Create Plan"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="rounded-none min-h-[36px] text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Plans
              </p>
              <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {plans?.length ?? 0}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Configured products
              </p>
            </Card>
            <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Plans
              </p>
              <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {activePlans}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Currently offered
              </p>
            </Card>
            <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
              <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Enrollments
              </p>
              <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
                {enrollments?.length ?? 0}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Active customer goals
              </p>
            </Card>
          </div>

          <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
            <CardHeader className="px-6 py-4 border-b border-border/60">
              <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
                Savings Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {plansLoading ? (
                <div className="h-40 animate-pulse rounded-none bg-muted/60" />
              ) : !plans || plans.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-xs text-muted-foreground mb-4">
                    No savings plans configured yet.
                  </p>
                  <Button
                    onClick={openCreate}
                    variant="outline"
                    className="gap-2 rounded-none text-xs font-semibold min-h-[36px]"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first plan
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                        <th className="py-3.5 px-4">Plan Name</th>
                        <th className="py-3.5 px-4">Frequency</th>
                        <th className="py-3.5 px-4 text-right">Min</th>
                        <th className="py-3.5 px-4 text-right">Max</th>
                        <th className="py-3.5 px-4 text-right">Duration</th>
                        <th className="py-3.5 px-4 text-right">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {plans.map((plan) => (
                        <tr
                          key={plan.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-foreground text-xs">
                              {plan.name}
                            </p>
                            {plan.description && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                                {plan.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 capitalize font-semibold text-foreground text-xs">
                            {plan.frequency}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
                            {formatGhs(plan.minAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold tabular-nums text-foreground">
                            {plan.maxAmount ? formatGhs(plan.maxAmount) : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right text-muted-foreground font-mono">
                            {plan.durationMonths
                              ? `${plan.durationMonths} mo`
                              : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <StatusBadge status={plan.status || "active"} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(plan)}
                                className="h-7 text-xs font-semibold rounded-none gap-1"
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleStatusMutation.mutate(plan)
                                }
                                disabled={toggleStatusMutation.isPending}
                                className="h-7 text-xs font-semibold rounded-none"
                              >
                                {plan.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </Button>
                            </div>
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

      {activeTab === "enrollments" && (
        <>
          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <Card
                  key={n}
                  className="rounded-none border border-border/60 animate-pulse h-32"
                />
              ))}
            </div>
          ) : !enrollments || enrollments.length === 0 ? (
            <Card className="p-8 text-center bg-card rounded-none border border-border/60">
              <p className="text-muted-foreground text-xs font-semibold">
                No savings plan enrollments found
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment) => {
                const customerName = enrollment.customer?.user
                  ? `${enrollment.customer.user.firstName} ${enrollment.customer.user.lastName}`
                  : "Unknown Saver";
                const saved = Number(enrollment.savedAmount || 0);
                const target = Number(enrollment.targetAmount || 0);
                const progress = enrollment.progressPercent || 0;

                return (
                  <Card
                    key={enrollment.id}
                    className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {enrollment.plan?.frequency} SUSU
                        </span>
                        <StatusBadge status={enrollment.status} />
                      </div>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        {enrollment.plan?.name || "Savings Goal"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Saver:{" "}
                        <span className="font-semibold text-foreground">
                          {customerName}
                        </span>{" "}
                        ({enrollment.customer?.customerNumber})
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Progress ({progress}%)
                          </span>
                          <span className="font-bold tabular-nums text-foreground">
                            {formatGhs(saved)} / {formatGhs(target)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-border/60 pt-2.5 text-muted-foreground font-mono">
                        <div>
                          <span className="block text-[10px] uppercase text-muted-foreground">
                            Started
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatDate(enrollment.startedAt)}
                          </span>
                        </div>
                        {enrollment.endsAt && (
                          <div>
                            <span className="block text-[10px] uppercase text-muted-foreground">
                              Ends
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatDate(enrollment.endsAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
