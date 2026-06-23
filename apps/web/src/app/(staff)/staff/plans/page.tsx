"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staffPlanApi, type SavingsPlan } from "@/lib/api";
import { formatGhs } from "@/lib/utils";
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
          <p className="text-sm text-muted-foreground mt-1">
            Manage savings products and track customer enrollments
          </p>
        </div>
        {activeTab === "plans" && !showForm && (
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Plan
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
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
            <Card className="border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">
                  {editingPlan ? "Edit Savings Plan" : "Create Savings Plan"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Plan name
                    </label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g. Weekly Susu"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Description
                    </label>
                    <Input
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Optional description for customers"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Frequency
                    </label>
                    <select
                      value={form.frequency}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          frequency: e.target.value as SavingsPlan["frequency"],
                        })
                      }
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Minimum amount (GHS)
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
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Maximum amount (GHS)
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
                      className="mt-1"
                    />
                  </div>
                  {formError && (
                    <p className="md:col-span-2 text-sm text-destructive">
                      {formError}
                    </p>
                  )}
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" disabled={isSaving} className="gap-2">
                      <Check className="h-4 w-4" />
                      {isSaving
                        ? "Saving..."
                        : editingPlan
                          ? "Save Changes"
                          : "Create Plan"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Plans
                </p>
                <p className="text-3xl font-bold mt-1">{plans?.length ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Plans
                </p>
                <p className="text-3xl font-bold mt-1">{activePlans}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Enrollments
                </p>
                <p className="text-3xl font-bold mt-1">
                  {enrollments?.length ?? 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Savings Products</CardTitle>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="h-40 animate-pulse rounded-lg bg-muted/60" />
              ) : !plans || plans.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No savings plans configured yet.
                  </p>
                  <Button
                    onClick={openCreate}
                    variant="outline"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first plan
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Frequency</th>
                        <th className="py-3 px-4 text-right">Min</th>
                        <th className="py-3 px-4 text-right">Max</th>
                        <th className="py-3 px-4 text-right">Duration</th>
                        <th className="py-3 px-4 text-right">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {plans.map((plan) => (
                        <tr key={plan.id} className="hover:bg-muted/30">
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-foreground">
                              {plan.name}
                            </p>
                            {plan.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {plan.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 capitalize text-foreground">
                            {plan.frequency}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs">
                            {formatGhs(plan.minAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs">
                            {plan.maxAmount ? formatGhs(plan.maxAmount) : "—"}
                          </td>
                          <td className="py-3.5 px-4 text-right text-muted-foreground">
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
                                className="h-8 gap-1"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  toggleStatusMutation.mutate(plan)
                                }
                                disabled={toggleStatusMutation.isPending}
                                className="h-8"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="animate-pulse">
                  <CardHeader className="p-4">
                    <div className="h-4 bg-muted w-1/3 rounded" />
                    <div className="h-6 bg-muted w-2/3 rounded mt-2" />
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-2 bg-muted rounded" />
                    <div className="h-4 bg-muted w-1/2 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !enrollments || enrollments.length === 0 ? (
            <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-dashed">
              <p className="text-muted-foreground text-sm">
                No savings plan enrollments found
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Customers enroll from their app after you create active savings
                plans.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="bg-card/65 backdrop-blur-md border border-border shadow-sm flex flex-col justify-between"
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          {enrollment.plan?.frequency} SUSU
                        </span>
                        <StatusBadge status={enrollment.status} />
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {enrollment.plan?.name || "Savings Goal"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Saver: <strong>{customerName}</strong> (
                        {enrollment.customer?.customerNumber})
                      </p>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">
                            Progress ({progress}%)
                          </span>
                          <span className="text-foreground">
                            {formatGhs(saved)} / {formatGhs(target)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3.5 mt-2 text-muted-foreground">
                        <div>
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                            Started At
                          </span>
                          <span className="font-semibold text-foreground">
                            {new Date(
                              enrollment.startedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {enrollment.endsAt && (
                          <div>
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                              Ends At
                            </span>
                            <span className="font-semibold text-foreground">
                              {new Date(enrollment.endsAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
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
