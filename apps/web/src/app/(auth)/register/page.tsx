"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthFooterExtras,
  authInputClassName,
} from "@/components/auth/auth-form-ui";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { getDashboardPath } from "@/lib/utils";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantParam = searchParams.get("tenant") || "";
  const {
    register,
    isLoading,
    error,
    clearError,
    tenantSlug,
    setTenantSlug,
    isAuthenticated,
    user,
  } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    tenant: tenantSlug || tenantParam,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const target = getDashboardPath(user.roles || []);
      router.replace(target);
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (tenantParam) {
      setForm((f) => ({ ...f, tenant: tenantParam }));
    }
  }, [tenantParam]);

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setTenantSlug(form.tenant);
    try {
      const result = await register(
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        },
        form.tenant,
      );
      router.push(`/verify?userId=${result.userId}`);
    } catch {
      // error in store
    }
  };

  return (
    <AuthShell>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Join your susu
        </h1>
        <p className="mt-2.5 text-[17px] text-muted-foreground">
          or{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0066cc] dark:text-[#38bdf8] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="tenant"
            className="block text-[17px] font-semibold text-foreground"
          >
            Susu company <span className="text-destructive">*</span>
          </label>
          <input
            id="tenant"
            name="tenant"
            type="text"
            placeholder="Company slug"
            className={authInputClassName}
            value={form.tenant}
            onChange={(e) => update("tenant", e.target.value)}
            required
            autoComplete="organization"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label
              htmlFor="firstName"
              className="block text-[17px] font-semibold text-foreground"
            >
              First name <span className="text-destructive">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First name"
              className={authInputClassName}
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="lastName"
              className="block text-[17px] font-semibold text-foreground"
            >
              Last name <span className="text-destructive">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last name"
              className={authInputClassName}
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-[17px] font-semibold text-foreground"
          >
            Email address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            className={authInputClassName}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="block text-[17px] font-semibold text-foreground"
          >
            Phone <span className="text-destructive">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone"
            className={authInputClassName}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
            autoComplete="tel"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-[17px] font-semibold text-foreground"
          >
            Password <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={cn(authInputClassName, "pr-10")}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-none bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 min-h-[48px] w-full rounded-xl text-[17px] font-semibold bg-[#0066cc] hover:bg-[#0052a3] text-white"
          loading={isLoading}
        >
          Create account
        </Button>
      </form>

      <AuthFooterExtras action="creating an account" mode="register" />
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">
          Loading registration settings...
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
