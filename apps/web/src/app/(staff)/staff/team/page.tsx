"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { teamApi, type TeamMember } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { Plus, X, Check, UserX, UserCheck } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  company_admin: "Company Admin",
  account_officer: "Account Officer",
  collector: "Collector",
  auditor: "Auditor",
};

function roleLabel(role: string) {
  return ROLE_LABELS[role] || role.replace(/_/g, " ");
}

export default function TeamManagementPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isCompanyAdmin = user?.roles.includes("company_admin");

  const [showForm, setShowForm] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "collector" as "collector" | "account_officer" | "auditor",
  });
  const [formError, setFormError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["staff-team"],
    queryFn: () => teamApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      teamApi.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["staff-team"] });
      if (res.credentials) setCredentials(res.credentials);
      setShowForm(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "collector",
      });
      setFormError("");
    },
    onError: (err) => {
      setFormError(
        err instanceof Error ? err.message : "Failed to add team member",
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "suspended";
    }) => teamApi.update(id, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["staff-team"] }),
    onError: (err) =>
      alert(err instanceof Error ? err.message : "Update failed"),
  });

  const members = data?.items ?? [];
  const activeCount = members.filter((m) => m.status === "active").length;
  const collectorCount = members.filter((m) =>
    m.roles.includes("collector"),
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setFormError("Name and email are required");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-title">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage collectors, account officers, and auditors
          </p>
        </div>
        {isCompanyAdmin && !showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Button>
        )}
      </div>

      {credentials && (
        <Card className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="pt-5 pb-5">
            <p className="text-sm font-semibold text-foreground">
              Team member created — share these credentials
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-mono font-medium">
                  {credentials.email}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Temporary password:{" "}
                </span>
                <span className="font-mono font-medium">
                  {credentials.temporaryPassword}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setCredentials(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && isCompanyAdmin && (
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Add Team Member</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  First name
                </label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Last name
                </label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Phone
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+233..."
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as typeof form.role,
                    })
                  }
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="collector">
                    Collector — field collections
                  </option>
                  <option value="account_officer">
                    Account Officer — back office
                  </option>
                  <option value="auditor">Auditor — read-only access</option>
                </select>
              </div>
              {formError && (
                <p className="md:col-span-2 text-sm text-destructive">
                  {formError}
                </p>
              )}
              <div className="md:col-span-2 flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {createMutation.isPending ? "Creating…" : "Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
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
              Team Size
            </p>
            <p className="text-3xl font-bold mt-1">{members.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active
            </p>
            <p className="text-3xl font-bold mt-1">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Collectors
            </p>
            <p className="text-3xl font-bold mt-1">{collectorCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Team</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-lg bg-muted/60" />
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No team members found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Customers</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4">Status</th>
                    {isCompanyAdmin && (
                      <th className="py-3 px-4 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {members.map((member: TeamMember) => (
                    <tr key={member.id} className="hover:bg-muted/30">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {member.roles.map((r) => (
                          <span
                            key={r}
                            className="inline-block text-xs font-medium capitalize bg-muted px-2 py-0.5 rounded mr-1"
                          >
                            {roleLabel(r)}
                          </span>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {member.roles.includes("collector")
                          ? member.customerCount
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={member.status} />
                      </td>
                      {isCompanyAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {!member.roles.includes("company_admin") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              disabled={statusMutation.isPending}
                              onClick={() =>
                                statusMutation.mutate({
                                  id: member.id,
                                  status:
                                    member.status === "active"
                                      ? "suspended"
                                      : "active",
                                })
                              }
                            >
                              {member.status === "active" ? (
                                <>
                                  <UserX className="h-3.5 w-3.5" /> Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3.5 w-3.5" /> Activate
                                </>
                              )}
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
