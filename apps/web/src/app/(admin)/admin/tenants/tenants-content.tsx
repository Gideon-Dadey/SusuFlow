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
    <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-1.5 text-xs border border-border/40">
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
          className={`h-3.5 w-3.5 ${copied ? "text-green-600 dark:text-green-400" : ""}`}
        />
      </button>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  trial: "bg-amber-50 text-amber-700",
  active: "bg-green-50 text-green-700",
  suspended: "bg-red-50 text-red-700",
  closed: "bg-muted text-muted-foreground",
};

export default function AdminTenantsPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: () => adminApi.listTenants(),
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
          <h1 className="dashboard-title">Platform Tenants</h1>
        </div>
        <Link href="/admin/tenants/new">
          <Button size="sm">Create organization</Button>
        </Link>
      </div>

      {actionMessage ? (
        <div className="rounded-lg border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-foreground">
          {actionMessage}
        </div>
      ) : null}

      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>All organizations ({tenants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TenantListSkeleton count={3} />
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">
              Failed to load tenants
            </p>
          ) : tenants.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No organizations yet
              </p>
              <Link href="/admin/tenants/new" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
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
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {tenant.name}
            </h2>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                statusStyles[tenant.status] ?? "bg-muted text-muted-foreground"
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
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{tenant.slug}</span> ·{" "}
            {tenant.email}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
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
              disabled={busy}
              onClick={onSuspend}
            >
              Suspend
            </Button>
          ) : null}
          {tenant.subscription?.plan === "growth" &&
          tenant.status !== "active" ? (
            <Button size="sm" disabled={busy} onClick={onCheckout}>
              Collect payment
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
