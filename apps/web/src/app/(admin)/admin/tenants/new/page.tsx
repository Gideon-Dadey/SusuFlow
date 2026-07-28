"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { adminApi, type CreateTenantPayload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function CreateTenantPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateTenantPayload>({
    slug: "",
    name: "",
    email: "",
    phone: "",
    plan: "growth",
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    adminPassword: "",
  });
  const [credentials, setCredentials] = useState<{
    tenantSlug: string;
    email: string;
    temporaryPassword?: string;
    loginUrl: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateTenantPayload) => adminApi.createTenant(data),
    onSuccess: (result) => {
      setCredentials(result.credentials);
    },
  });

  const update = (field: keyof CreateTenantPayload, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      slug: form.slug.toLowerCase().trim(),
      adminPassword: form.adminPassword || undefined,
      phone: form.phone || undefined,
      adminPhone: form.adminPhone || undefined,
    });
  };

  if (credentials) {
    return (
      <div className="w-full space-y-6">
        <div className="page-header">
          <h1 className="dashboard-title">Organization provisioned</h1>
        </div>
        <Card className="portal-card border-secondary/30 rounded-none">
          <CardHeader>
            <CardTitle>Login credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-foreground">Tenant slug:</span>{" "}
              <code className="rounded-none bg-muted px-2 py-0.5">
                {credentials.tenantSlug}
              </code>
            </p>
            <p>
              <span className="font-medium text-foreground">Admin email:</span>{" "}
              {credentials.email}
            </p>
            {credentials.temporaryPassword ? (
              <p>
                <span className="font-medium text-foreground">
                  Temporary password:
                </span>{" "}
                <code className="rounded-none bg-muted px-2 py-0.5">
                  {credentials.temporaryPassword}
                </code>
              </p>
            ) : null}
            <div className="space-y-2 pt-2 pb-4">
              <CopyLinkButton
                label="Admin Secure Login"
                url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/login?tenant=${credentials.tenantSlug}`}
              />
              <CopyLinkButton
                label="Saver Signup URL"
                url={`${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/register?tenant=${credentials.tenantSlug}`}
              />
            </div>
            <p className="text-muted-foreground">
              The organization starts on a 14-day trial. Activate manually after
              payment or use Collect payment from the tenants list.
            </p>
            <div className="flex gap-3 pt-4">
              <Button size="sm" onClick={() => router.push("/admin/tenants")}>
                View all tenants
              </Button>
              <Link href="/admin/tenants/new">
                <Button size="sm" variant="outline">
                  Provision another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="dashboard-title">Create organization</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Provision a new multi-tenant susu company workspace and
            administrator account
          </p>
        </div>
        <Link href="/admin/tenants">
          <Button size="sm" variant="outline">
            Back to tenants
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Organization Details */}
          <Card className="portal-card rounded-none border-border/70 h-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Slug"
                  placeholder="Slug"
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  required
                />
                <Input
                  label="Name"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
                <Input
                  label="Phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Plan
                </label>
                <select
                  className="flex h-11 w-full rounded-none border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.plan}
                  onChange={(e) => update("plan", e.target.value)}
                >
                  <option value="starter">Starter (14-day trial)</option>
                  <option value="growth">Growth (GHS 299/mo)</option>
                  <option value="enterprise">Enterprise (Custom)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Company Administrator */}
          <Card className="portal-card rounded-none border-border/70 h-full">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Initial Company Administrator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="First name"
                  placeholder="First name"
                  value={form.adminFirstName}
                  onChange={(e) => update("adminFirstName", e.target.value)}
                  required
                />
                <Input
                  label="Last name"
                  placeholder="Last name"
                  value={form.adminLastName}
                  onChange={(e) => update("adminLastName", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  placeholder="Email"
                  value={form.adminEmail}
                  onChange={(e) => update("adminEmail", e.target.value)}
                  required
                />
                <Input
                  label="Phone"
                  placeholder="Phone"
                  value={form.adminPhone}
                  onChange={(e) => update("adminPhone", e.target.value)}
                />
              </div>

              <Input
                label="Password"
                type="password"
                placeholder="Password"
                value={form.adminPassword}
                onChange={(e) => update("adminPassword", e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {mutation.isError ? (
          <div className="rounded-none bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {(mutation.error as Error)?.message ||
              "Failed to create organization"}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
          <Link href="/admin/tenants">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            className="font-bold"
            loading={mutation.isPending}
          >
            Provision organization
          </Button>
        </div>
      </form>
    </div>
  );
}
