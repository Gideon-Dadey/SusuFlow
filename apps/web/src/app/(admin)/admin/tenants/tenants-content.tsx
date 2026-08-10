"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { adminApi, type AdminTenant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { TenantListSkeleton } from "@/components/ui/skeleton";
import { formatDate, getInitials, cn } from "@/lib/utils";
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Search,
  LayoutGrid,
  ListFilter,
  Copy,
  Check,
  Plus,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  X,
  UserCheck,
  Shield,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faUserGear,
  faUserTag,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

function CopyLinkButton({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 rounded-none bg-muted/40 px-3 py-1.5 text-xs border border-border/60">
      <span className="font-semibold text-muted-foreground uppercase text-[9px] tracking-wider whitespace-nowrap">
        {label}:
      </span>
      <span className="font-mono text-foreground truncate max-w-[180px] sm:max-w-none">
        {url}
      </span>
      <button
        onClick={handleCopy}
        className="ml-auto text-muted-foreground hover:text-foreground focus:outline-none transition-colors px-1"
        title="Copy Link"
        type="button"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  trial:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  active:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  suspended:
    "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  closed: "bg-muted text-muted-foreground border border-border/60",
};

export default function AdminTenantsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedTenant, setSelectedTenant] = useState<AdminTenant | null>(
    null,
  );

  // Fetch Tenants
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => adminApi.listTenants(),
    placeholderData: (prev) => prev,
  });

  // Fetch Global Users (Staff) for tenant detail breakdown
  const { data: usersData } = useQuery({
    queryKey: ["admin-global-users"],
    queryFn: () => adminApi.getUsers(),
  });

  // Fetch Global Customers (Savers) for tenant detail breakdown
  const { data: customersData } = useQuery({
    queryKey: ["admin-global-customers"],
    queryFn: () => adminApi.getCustomers(),
  });

  const tenants = data?.items ?? [];
  const allUsers = usersData?.items ?? [];
  const allCustomers = customersData?.items ?? [];

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
      );
    });
  }, [tenants, statusFilter, searchQuery]);

  // Executive Metric Counts
  const totalTenants = tenants.length;
  const activeCount = tenants.filter((t) => t.status === "active").length;
  const trialCount = tenants.filter((t) => t.status === "trial").length;
  const suspendedCount = tenants.filter((t) => t.status === "suspended").length;

  const totalUsersCount = tenants.reduce(
    (sum, t) => sum + (t._count?.users ?? 0),
    0,
  );
  const totalCustomersCount = tenants.reduce(
    (sum, t) => sum + (t._count?.customers ?? 0),
    0,
  );

  // Filter Individuals for Currently Inspected Tenant
  const tenantPersonnel = useMemo(() => {
    if (!selectedTenant) return [];
    return allUsers.filter(
      (u: any) =>
        u.tenant?.slug === selectedTenant.slug ||
        u.tenantId === selectedTenant.id,
    );
  }, [allUsers, selectedTenant]);

  const tenantSavers = useMemo(() => {
    if (!selectedTenant) return [];
    return allCustomers.filter(
      (c: any) =>
        c.tenant?.slug === selectedTenant.slug ||
        c.tenantId === selectedTenant.id,
    );
  }, [allCustomers, selectedTenant]);

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateTenant(id),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-global-summary"] });
      if (selectedTenant && selectedTenant.id === (res as any).tenant?.id) {
        setSelectedTenant((res as any).tenant);
      }
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.suspendTenant(id, "Suspended by platform administrator"),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-global-summary"] });
      if (selectedTenant && selectedTenant.id === (res as any).tenant?.id) {
        setSelectedTenant((res as any).tenant);
      }
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: string) => adminApi.createBillingCheckout(id),
    onSuccess: (res) => {
      if (res.authorizationUrl) {
        window.open(res.authorizationUrl, "_blank", "noopener,noreferrer");
      }
      setActionMessage(res.message || "Payment link opened");
    },
  });

  useEffect(() => {
    const mockPayment = searchParams.get("mockPayment");
    const tenantId = searchParams.get("tenantId");
    if (mockPayment && tenantId) {
      adminApi
        .confirmMockPayment(mockPayment, tenantId)
        .then((res) => {
          setActionMessage(res.message);
          queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
        })
        .catch(() => setActionMessage("Mock payment failed"));
    }
  }, [searchParams, queryClient]);

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes("super_admin")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-none bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <FontAwesomeIcon icon={faUserShield} className="h-3 w-3" />
          Super Admin
        </span>
      );
    }
    if (roles.includes("company_admin")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-none bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          <FontAwesomeIcon icon={faUserGear} className="h-3 w-3" />
          Company Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-none bg-muted text-muted-foreground border border-border/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        <FontAwesomeIcon icon={faUserTag} className="h-3 w-3" />
        Staff Account
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="dashboard-title">Platform Organizations (Tenants)</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise multi-tenant administration, organization provisioning,
            and global access governance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
          <Link href="/admin/tenants/new">
            <Button size="sm" className="font-semibold text-xs gap-1.5">
              <Plus className="h-4 w-4" />
              Provision Organization
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage ? (
        <div className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-foreground flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {/* Executive Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Organizations
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {totalTenants}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            {activeCount} active · {trialCount} trial · {suspendedCount}{" "}
            suspended
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Active Savers
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {totalCustomersCount}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            Registered customer accounts
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Personnel & Staff
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {totalUsersCount}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            Admins, officers & collectors
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Platform License
          </p>
          <p className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            Multi-Tenant
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            SusuFlow Enterprise Engine
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { label: "All Orgs", value: "" },
            { label: "Active", value: "active" },
            { label: "Trial", value: "trial" },
            { label: "Suspended", value: "suspended" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold transition-colors border-b-2",
                statusFilter === tab.value
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-none">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 text-xs font-semibold transition-colors",
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 text-xs font-semibold transition-colors",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground",
              )}
              title="Table View"
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search org name, slug or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 text-xs rounded-none border border-border/60 bg-background outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Main Organizations Directory */}
      {isLoading ? (
        <TenantListSkeleton count={3} />
      ) : error ? (
        <Card className="p-8 text-center bg-card border-dashed">
          <p className="text-xs text-destructive font-semibold">
            Failed to load platform organizations.
          </p>
        </Card>
      ) : filteredTenants.length === 0 ? (
        <Card className="p-8 text-center bg-card border-dashed">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-xs text-muted-foreground font-medium">
            No organizations matching filter criteria.
          </p>
          <Link href="/admin/tenants/new" className="mt-4 inline-block">
            <Button variant="outline" size="sm" className="text-xs">
              Provision First Organization
            </Button>
          </Link>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID DEEP CARDS VIEW */
        <div className="space-y-4">
          {filteredTenants.map((tenant) => (
            <TenantDeepCard
              key={tenant.id}
              tenant={tenant}
              onActivate={() => activateMutation.mutate(tenant.id)}
              onSuspend={() => suspendMutation.mutate(tenant.id)}
              onCheckout={() => checkoutMutation.mutate(tenant.id)}
              onInspect={() => setSelectedTenant(tenant)}
              busy={
                activateMutation.isPending ||
                suspendMutation.isPending ||
                checkoutMutation.isPending
              }
            />
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="rounded-none border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase bg-muted/20">
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Tenant Slug</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4 text-center">Savers</th>
                  <th className="py-3 px-4 text-center">Staff</th>
                  <th className="py-3 px-4">Provisioned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {getInitials(tenant.name)}
                        </div>
                        <span>{tenant.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-foreground">
                      {tenant.slug}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {tenant.email}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold tabular-nums text-foreground">
                      {tenant._count?.customers ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold tabular-nums text-foreground">
                      {tenant._count?.users ?? 0}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(tenant.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          statusStyles[tenant.status] ??
                          "bg-muted text-muted-foreground border border-border/60"
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-semibold h-7 px-2"
                          onClick={() => setSelectedTenant(tenant)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Details
                        </Button>
                        {tenant.status !== "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-semibold h-7 px-2"
                            disabled={
                              activateMutation.isPending ||
                              suspendMutation.isPending
                            }
                            onClick={() => activateMutation.mutate(tenant.id)}
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-semibold h-7 px-2 border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                            disabled={
                              activateMutation.isPending ||
                              suspendMutation.isPending
                            }
                            onClick={() => suspendMutation.mutate(tenant.id)}
                          >
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FULL-WIDTH PROFESSIONAL MVP-GRADE ORGANIZATION INSPECTION MODAL */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-6xl bg-card border border-border/60 rounded-none overflow-hidden flex flex-col my-auto shadow-2xl max-h-[92vh]">
            {/* Clean Professional Light Header (No Black Background) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 bg-card text-foreground">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                  {getInitials(selectedTenant.name)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                    <span>{selectedTenant.name}</span>
                    <span
                      className={`inline-flex rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        statusStyles[selectedTenant.status] ??
                        "bg-muted text-muted-foreground border border-border/60"
                      }`}
                    >
                      {selectedTenant.status}
                    </span>
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    Tenant Slug:{" "}
                    <span className="font-bold text-foreground">
                      {selectedTenant.slug}
                    </span>{" "}
                    · Org ID: {selectedTenant.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center justify-center transition-colors border border-border/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Full-Width Modal Scrollable Content */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              {/* Top 4 Metric Stat Boxes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-muted/30 border border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Registered Savers
                  </span>
                  <span className="text-xl font-bold tabular-nums text-foreground mt-0.5 block">
                    {selectedTenant._count?.customers ?? 0} Customers
                  </span>
                </div>
                <div className="p-3.5 bg-muted/30 border border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Staff Personnel
                  </span>
                  <span className="text-xl font-bold tabular-nums text-foreground mt-0.5 block">
                    {selectedTenant._count?.users ?? 0} Members
                  </span>
                </div>
                <div className="p-3.5 bg-muted/30 border border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    SaaS Billing Plan
                  </span>
                  <span className="text-sm font-bold text-foreground uppercase mt-1 block">
                    {selectedTenant.subscription?.plan || "Growth"} Tier
                  </span>
                </div>
                <div className="p-3.5 bg-muted/30 border border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Provisioned Date
                  </span>
                  <span className="text-xs font-semibold text-foreground mt-1 block">
                    {formatDate(selectedTenant.createdAt)}
                  </span>
                </div>
              </div>

              {/* Organization Info & Direct Access Links Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Contact & Admin Credentials */}
                <div className="lg:col-span-6 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Organization Contact & Specs
                  </h3>
                  <div className="p-3.5 rounded-none bg-muted/20 border border-border/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">
                        Contact Email:
                      </span>
                      <span className="font-semibold text-foreground">
                        {selectedTenant.email}
                      </span>
                    </div>
                    {selectedTenant.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">
                          Contact Phone:
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {selectedTenant.phone}
                        </span>
                      </div>
                    )}
                    {selectedTenant.subscription?.trialEnd && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">
                          Trial Period End:
                        </span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {formatDate(selectedTenant.subscription.trialEnd)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Access Links */}
                <div className="lg:col-span-6 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Portal Direct Access Shortcuts
                  </h3>
                  <CopyLinkButton
                    label="Admin Login URL"
                    url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/login?tenant=${selectedTenant.slug}`}
                  />
                  <CopyLinkButton
                    label="Saver Signup URL"
                    url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/register?tenant=${selectedTenant.slug}`}
                  />
                </div>
              </div>

              {/* INDIVIDUALS UNDER THIS TENANT SECTION 1: PERSONNEL & STAFF */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>
                      Enrolled Staff Personnel ({tenantPersonnel.length})
                    </span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Admins, Officers, Collectors & Auditors
                  </span>
                </div>

                {tenantPersonnel.length === 0 ? (
                  <div className="p-4 bg-muted/20 border border-border/60 text-center text-xs text-muted-foreground">
                    No individual staff members found matching this tenant slug.
                  </div>
                ) : (
                  <div className="border border-border/60 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                          <th className="py-2.5 px-3">Personnel Name</th>
                          <th className="py-2.5 px-3">Email Address</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Role Designation</th>
                          <th className="py-2.5 px-3 text-right">
                            Security Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {tenantPersonnel.map((u: any) => {
                          const roles =
                            u.userRoles?.map((ur: any) => ur.role?.name) ?? [];
                          return (
                            <tr
                              key={u.id}
                              className="hover:bg-muted/20 transition-colors"
                            >
                              <td className="py-2.5 px-3 font-bold text-foreground">
                                {u.firstName} {u.lastName}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">
                                {u.email}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">
                                {u.phone || "N/A"}
                              </td>
                              <td className="py-2.5 px-3">
                                {getRoleBadge(roles)}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {u.emailVerified ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    <FontAwesomeIcon
                                      icon={faCircleCheck}
                                      className="mr-1 h-3 w-3 inline"
                                    />{" "}
                                    Verified
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground/60 italic">
                                    Unverified
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* INDIVIDUALS UNDER THIS TENANT SECTION 2: REGISTERED SAVERS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Registered Savers & Customers ({tenantSavers.length})
                    </span>
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Customer savings accounts
                  </span>
                </div>

                {tenantSavers.length === 0 ? (
                  <div className="p-4 bg-muted/20 border border-border/60 text-center text-xs text-muted-foreground">
                    No registered savers found for this organization yet.
                  </div>
                ) : (
                  <div className="border border-border/60 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">
                          <th className="py-2.5 px-3">Saver Name</th>
                          <th className="py-2.5 px-3">Customer Number</th>
                          <th className="py-2.5 px-3">Contact Email / Phone</th>
                          <th className="py-2.5 px-3 text-center">KYC Level</th>
                          <th className="py-2.5 px-3 text-right">
                            Account Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {tenantSavers.map((c: any) => (
                          <tr
                            key={c.id}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              {c.user
                                ? `${c.user.firstName} ${c.user.lastName}`
                                : "Unknown Saver"}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-xs text-foreground">
                              {c.customerNumber}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">
                              {c.user?.email || "N/A"}{" "}
                              {c.user?.phone ? `· ${c.user.phone}` : ""}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="inline-flex items-center gap-1 rounded-none bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                                <Shield className="h-3 w-3" /> Level{" "}
                                {c.kycLevel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <StatusBadge status={c.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-border/60 flex flex-wrap gap-2 justify-end">
                {selectedTenant.status !== "active" ? (
                  <Button
                    size="sm"
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={
                      activateMutation.isPending || suspendMutation.isPending
                    }
                    onClick={() => activateMutation.mutate(selectedTenant.id)}
                  >
                    <Unlock className="h-3.5 w-3.5 mr-1.5" />
                    Activate Organization
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                    disabled={
                      activateMutation.isPending || suspendMutation.isPending
                    }
                    onClick={() => suspendMutation.mutate(selectedTenant.id)}
                  >
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Suspend Organization
                  </Button>
                )}

                {selectedTenant.subscription?.plan === "growth" &&
                  selectedTenant.status !== "active" && (
                    <Button
                      size="sm"
                      className="text-xs font-semibold"
                      disabled={checkoutMutation.isPending}
                      onClick={() => checkoutMutation.mutate(selectedTenant.id)}
                    >
                      <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                      Collect Payment
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TenantDeepCard({
  tenant,
  onActivate,
  onSuspend,
  onCheckout,
  onInspect,
  busy,
}: {
  tenant: AdminTenant;
  onActivate: () => void;
  onSuspend: () => void;
  onCheckout: () => void;
  onInspect: () => void;
  busy: boolean;
}) {
  const initials = getInitials(tenant.name);

  return (
    <div className="rounded-none border border-border/60 bg-card p-4 sm:p-5 shadow-sm space-y-4 hover:border-primary/50 transition-colors">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Org Logo Avatar */}
          <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-foreground truncate">
                {tenant.name}
              </h2>
              <span
                className={`inline-flex rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  statusStyles[tenant.status] ??
                  "bg-muted text-muted-foreground border border-border/60"
                }`}
              >
                {tenant.status}
              </span>
              {tenant.subscription ? (
                <span className="text-xs text-muted-foreground font-mono">
                  {tenant.subscription.plan} · {tenant.subscription.status}
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Slug:{" "}
              <span className="font-mono font-bold text-foreground">
                {tenant.slug}
              </span>{" "}
              · Contact:{" "}
              <span className="font-medium text-foreground">
                {tenant.email}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold h-8"
            onClick={onInspect}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Full Details & Individuals
          </Button>

          {tenant.status !== "active" ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold h-8"
              disabled={busy}
              onClick={onActivate}
            >
              Activate
            </Button>
          ) : null}

          {tenant.status !== "suspended" ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-semibold h-8 border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
              disabled={busy}
              onClick={onSuspend}
            >
              Suspend
            </Button>
          ) : null}

          {tenant.subscription?.plan === "growth" &&
          tenant.status !== "active" ? (
            <Button
              size="sm"
              className="text-xs font-semibold h-8"
              disabled={busy}
              onClick={onCheckout}
            >
              Collect payment
            </Button>
          ) : null}
        </div>
      </div>

      {/* 4 Micro Stat Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 bg-muted/30 border border-border/60 rounded-none">
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Registered Savers
          </span>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {tenant._count?.customers ?? 0} Customers
          </span>
        </div>

        <div className="p-2.5 bg-muted/30 border border-border/60 rounded-none">
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Staff Members
          </span>
          <span className="text-sm font-bold tabular-nums text-foreground">
            {tenant._count?.users ?? 0} Personnel
          </span>
        </div>

        <div className="p-2.5 bg-muted/30 border border-border/60 rounded-none">
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Provisioned Date
          </span>
          <span className="text-xs font-semibold text-foreground">
            {formatDate(tenant.createdAt)}
          </span>
        </div>

        <div className="p-2.5 bg-muted/30 border border-border/60 rounded-none">
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Subscription
          </span>
          <span className="text-xs font-semibold text-foreground uppercase">
            {tenant.subscription?.plan || "Growth"}
          </span>
        </div>
      </div>

      {/* Access URL Copier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        <CopyLinkButton
          label="Admin Login"
          url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/login?tenant=${tenant.slug}`}
        />
        <CopyLinkButton
          label="Saver Signup"
          url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/register?tenant=${tenant.slug}`}
        />
      </div>
    </div>
  );
}
