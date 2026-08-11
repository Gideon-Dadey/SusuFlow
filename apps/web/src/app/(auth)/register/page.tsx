"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "@/components/icons/phosphor";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthFooterExtras,
  authHeadingClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
  authSubmitClassName,
  authSubtextClassName,
  ModernInput,
} from "@/components/auth/auth-form-ui";
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
    <AuthShell
      wideForm
      visualTone="sand"
      visualTagline="Set up your susu company in minutes, not months."
    >
      <div>
        <p className="ofx-eyebrow mb-3">Get started</p>
        <h1 className={authHeadingClassName}>Create an account</h1>
        <p className={authSubtextClassName}>
          or{" "}
          <Link href="/login" className={authLinkClassName}>
            Sign in to your account
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ModernInput
          id="tenant"
          label="Susu company"
          name="tenant"
          type="text"
          placeholder="Company slug (e.g. premier-susu)"
          value={form.tenant}
          onChange={(e) => update("tenant", e.target.value)}
          required
          autoComplete="organization"
        />

        <div className="grid grid-cols-2 gap-3">
          <ModernInput
            id="firstName"
            label="First name"
            name="firstName"
            type="text"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
            required
            autoComplete="given-name"
          />
          <ModernInput
            id="lastName"
            label="Last name"
            name="lastName"
            type="text"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>

        <ModernInput
          id="email"
          label="Email address"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          autoComplete="email"
        />

        <ModernInput
          id="phone"
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="024XXXXXXX"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
          autoComplete="tel"
        />

        <div className="space-y-1.5 w-full">
          <label htmlFor="password" className={authLabelClassName}>
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              className={cn(authInputClassName, "pr-12")}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 font-medium border border-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className={authSubmitClassName}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          Create Account
        </button>
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
