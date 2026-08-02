"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi, type AdminTenant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantListSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";

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
      <span className="font-mono text-foreground truncate max-w-[200px] sm:max-w-none">
        {url}
      </span>
      <button
        onClick={handleCopy}
        className="ml-auto text-muted-foreground hover:text-foreground focus:outline-none transition-colors px-1"
        title="Copy Link"
        type="button"
      >
        <FontAwesomeIcon
          icon={copied ? faCheck : faCopy}
          className={`h-3.5 w-3.5 ${copied ? "text-emerald-600 dark:text-emerald-400" : ""}`}
        />
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => adminApi.listTenants(),
    placeholderData: (prev) => prev,
  });

  const tenants = data?.items ?? [];

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateTenant(id),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.suspendTenant(id, "Suspended by platform admin"),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="dashboard-title">Platform Organizations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage registered Susu companies, tenant access rules, and
            organization provisioning.
          </p>
        </div>
        <Link href="/admin/tenants/new">
          <Button size="sm" className="rounded-none font-semibold text-xs">
            Create organization
          </Button>
        </Link>
      </div>

      {actionMessage ? (
        <div className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-foreground">
          {actionMessage}
        </div>
      ) : null}

      <Card className="rounded-none border border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base font-bold">
            All organizations ({tenants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TenantListSkeleton count={3} />
          ) : error ? (
            <p className="py-8 text-center text-xs text-destructive">
              Failed to load organizations
            </p>
          ) : tenants.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">
                No organizations registered yet
              </p>
              <Link href="/admin/tenants/new" className="mt-4 inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none text-xs"
                >
                  Provision first organization
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <TenantRow
                  key={tenant.id}
                  tenant={tenant}
                  onActivate={() => activateMutation.mutate(tenant.id)}
                  onSuspend={() => suspendMutation.mutate(tenant.id)}
                  onCheckout={() => checkoutMutation.mutate(tenant.id)}
                  busy={
                    activateMutation.isPending ||
                    suspendMutation.isPending ||
                    checkoutMutation.isPending
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TenantRow({
  tenant,
  onActivate,
  onSuspend,
  onCheckout,
  busy,
}: {
  tenant: AdminTenant;
  onActivate: () => void;
  onSuspend: () => void;
  onCheckout: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-none border border-border/60 bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
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
              <span className="text-xs text-muted-foreground">
                {tenant.subscription.plan} · {tenant.subscription.status}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="font-mono font-medium text-foreground">
              {tenant.slug}
            </span>{" "}
            · {tenant.email}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Created {formatDate(tenant.createdAt)}
            {tenant._count
              ? ` · ${tenant._count.users} users · ${tenant._count.customers} customers`
              : ""}
            {tenant.subscription?.trialEnd
              ? ` · Trial ends ${formatDate(tenant.subscription.trialEnd)}`
              : ""}
          </p>
          <div className="mt-3.5 max-w-xl space-y-2">
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
        <div className="flex flex-wrap gap-2">
          {tenant.status !== "active" ? (
            <Button
              size="sm"
              variant="outline"
              className="rounded-none text-xs font-semibold"
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
              className="rounded-none text-xs font-semibold border-red-500/30 hover:bg-red-500/10 text-red-600 dark:text-red-400"
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
              className="rounded-none text-xs font-semibold"
              disabled={busy}
              onClick={onCheckout}
            >
              Collect payment
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
