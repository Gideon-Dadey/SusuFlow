"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff } from "@/components/icons/phosphor";
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
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { getDashboardPath } from "@/lib/utils";

const REMEMBER_EMAIL_KEY = "susuflow-remember-email";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantParam = searchParams.get("tenant") || "";
  const queryClient = useQueryClient();
  const {
    login,
    verifyMfaLogin,
    error,
    clearError,
    setTenantSlug,
    tenantSlug,
    isAuthenticated,
    user,
  } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [mfaChallenge, setMfaChallenge] = useState<{
    mfaToken: string;
    userId: string;
    email: string;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => {
    if (isAuthenticated && user) {
      const target = getDashboardPath(user.roles || []);
      router.replace(target);
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (tenantParam) {
      setTenantSlug(tenantParam);
    }
  }, [tenantParam, setTenantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password, tenantParam || tenantSlug);
      setIsSubmitting(false);
      if (res.mfaRequired && res.mfaToken && res.userId) {
        setMfaChallenge({
          mfaToken: res.mfaToken,
          userId: res.userId,
          email: res.email || email,
        });
        setSuccessMessage("Security verification code sent to your email");
        return;
      }
      if (res.path) {
        setSuccessMessage("You are logged in successfully");
        router.prefetch(res.path);
        window.setTimeout(() => {
          queryClient.clear();
          router.replace(res.path!);
        }, 450);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaChallenge || !mfaCode) return;
    clearError();
    setSuccessMessage("");
    setIsSubmitting(true);
    try {
      const path = await verifyMfaLogin(
        mfaChallenge.mfaToken,
        mfaChallenge.userId,
        mfaCode,
        tenantParam || tenantSlug,
      );
      setIsSubmitting(false);
      setSuccessMessage("MFA verification successful!");
      router.prefetch(path);
      window.setTimeout(() => {
        queryClient.clear();
        router.replace(path);
      }, 450);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (mfaChallenge) {
    return (
      <AuthShell visualTone="sage">
        <div>
          <p className="ofx-eyebrow mb-3">Welcome back</p>
          <h1 className={authHeadingClassName}>Two-Factor Verification</h1>
          <p className={authSubtextClassName}>
            Enter the 6-digit verification code sent to{" "}
            <strong className="text-foreground">{mfaChallenge.email}</strong> to
            complete your sign in.
          </p>
        </div>

        <form onSubmit={handleMfaSubmit} className="mt-8 space-y-5">
          <ModernInput
            id="mfa-code"
            label="6-Digit MFA Security Code"
            type="text"
            maxLength={8}
            placeholder="123456"
            required
            autoFocus
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className="font-mono font-bold tracking-widest text-center text-lg"
          />

          {successMessage ? (
            <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 font-medium">
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>{successMessage}</span>
            </p>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 font-medium border border-red-200">
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <button
              type="submit"
              className={authSubmitClassName}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              Verify & Complete Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMfaChallenge(null);
                clearError();
              }}
              className="ofx-btn ofx-btn-outline w-full"
            >
              Back to Login
            </button>
          </div>
        </form>

        <AuthFooterExtras action="signing in" mode="login" />
      </AuthShell>
    );
  }

  return (
    <AuthShell visualTone="sage">
      <div>
        <p className="ofx-eyebrow mb-3">Welcome back</p>
        <h1 className={authHeadingClassName}>Sign in to your account</h1>
        <p className={authSubtextClassName}>
          or{" "}
          <Link href="/register" className={authLinkClassName}>
            Create an account for your Susu
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <ModernInput
          id="email"
          label="Email address"
          name="email"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="space-y-1.5 w-full">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className={authLabelClassName}>
              Password <span className="text-red-500">*</span>
            </label>
            <Link href="/contact" className={cn(authLinkClassName, "text-sm")}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={cn(authInputClassName, "pr-12")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

        <label className="flex cursor-pointer items-center gap-2 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border accent-[var(--ofx-ink)] cursor-pointer"
          />
          <span className="text-sm font-medium text-foreground/80">
            Remember me on this device
          </span>
        </label>

        {successMessage ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700 font-medium border border-emerald-500/20">
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{successMessage}</span>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 font-medium border border-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className={cn(authSubmitClassName, successMessage && "opacity-50")}
          disabled={isSubmitting || !!successMessage}
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : null}
          Sign In
        </button>
      </form>

      <AuthFooterExtras action="signing in" mode="login" />
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">
          Loading login credentials...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
