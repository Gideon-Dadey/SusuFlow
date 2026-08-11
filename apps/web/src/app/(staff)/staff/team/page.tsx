"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { teamApi, type TeamMember } from "@/lib/api";
import { getInitials, formatDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { Plus, X, Check, UserX, UserCheck } from "@/components/icons/phosphor";
import { CompanyPageHeader } from "@/components/company-admin/company-page-header";
import { CompanyPanel } from "@/components/company-admin/company-panel";

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
    <div className="space-y-5">
      <CompanyPageHeader
        title="Team"
        actions={
          isCompanyAdmin && !showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="company-cta-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              Add user
            </button>
          ) : null
        }
      />

      {credentials && (
        <Card className="rounded-none border border-emerald-500/40 bg-emerald-500/10 p-4">
          <CardContent className="p-0">
            <p className="text-xs font-semibold text-foreground">
              Team member created — share these credentials
            </p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-semibold text-foreground">
                  {credentials.email}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">
                  Temporary Password:{" "}
                </span>
                <span className="font-semibold text-foreground">
                  {credentials.temporaryPassword}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs font-semibold min-h-[32px]"
              onClick={() => setCredentials(null)}
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && isCompanyAdmin && (
        <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
              Add Team Member
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  First Name *
                </label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="rounded-none border border-border/60 text-xs min-h-[38px]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Last Name *
                </label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="rounded-none border border-border/60 text-xs min-h-[38px]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-none border border-border/60 text-xs min-h-[38px]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Phone
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+233..."
                  className="rounded-none border border-border/60 text-xs min-h-[38px]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as typeof form.role,
                    })
                  }
                  className="w-full rounded-none border border-border/60 bg-card px-3 py-2 text-xs text-foreground outline-none min-h-[38px]"
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
                <p className="md:col-span-2 text-xs font-semibold text-red-500">
                  {formError}
                </p>
              )}
              <div className="md:col-span-2 flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="gap-2 min-h-[36px] text-xs font-semibold bg-primary text-primary-foreground"
                >
                  <Check className="h-4 w-4" />
                  {createMutation.isPending ? "Creating…" : "Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="min-h-[36px] text-xs font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="company-panel p-4">
          <p className="company-meta uppercase tracking-[0.06em]">Team size</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {members.length}
          </p>
        </div>
        <div className="company-panel p-4">
          <p className="company-meta uppercase tracking-[0.06em]">
            Active members
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {activeCount}
          </p>
        </div>
        <div className="company-panel p-4">
          <p className="company-meta uppercase tracking-[0.06em]">
            Field collectors
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {collectorCount}
          </p>
        </div>
      </div>

      <CompanyPanel>
        <CardHeader className="px-6 py-4 border-b border-border/60">
          <CardTitle className="text-sm sm:text-base font-semibold text-foreground">
            Organization Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-none bg-muted/60" />
          ) : members.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No team members found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3.5 px-4">Member</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Savers</th>
                    <th className="py-3.5 px-4">Last Login</th>
                    <th className="py-3.5 px-4">Status</th>
                    {isCompanyAdmin && (
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {members.map((member: TeamMember) => (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(member.firstName, member.lastName)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {member.roles.map((r) => (
                          <span
                            key={r}
                            className="inline-block text-[10px] font-semibold uppercase bg-muted/60 px-2 py-0.5 rounded-none mr-1 text-muted-foreground"
                          >
                            {roleLabel(r)}
                          </span>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                        {member.roles.includes("collector")
                          ? member.customerCount
                          : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground font-mono">
                        {member.lastLoginAt
                          ? formatDate(member.lastLoginAt)
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
                              className="h-7 text-xs font-semibold gap-1"
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
                                  <UserX className="h-3 w-3" /> Suspend
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3 w-3" /> Activate
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
      </CompanyPanel>
    </div>
  );
}
