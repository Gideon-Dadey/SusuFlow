"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthFooterExtras,
  authHeadingClassName,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
  authSubtextClassName,
} from "@/components/auth/auth-form-ui";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

  // MFA Challenge State
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
      <AuthShell>
        <div>
          <h1 className={authHeadingClassName}>Two-Factor Verification</h1>
          <p className={authSubtextClassName}>
            Enter the 6-digit verification code sent to{" "}
            <strong className="text-foreground">{mfaChallenge.email}</strong> to
            complete your sign in.
          </p>
        </div>

        <form onSubmit={handleMfaSubmit} className="mt-8 space-y-5">
          <div className="space-y-1.5">
            <label className={authLabelClassName}>
              6-Digit MFA Security Code{" "}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              maxLength={8}
              placeholder="123456"
              className={cn(
                authInputClassName,
                "font-mono font-bold tracking-widest text-center text-lg h-12",
              )}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              required
              autoFocus
            />
          </div>

          {successMessage ? (
            <p className="flex items-center gap-2 rounded-none bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold">
              <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>{successMessage}</span>
            </p>
          ) : null}

          {error ? (
            <p className="rounded-none bg-destructive/10 px-3 py-2 text-xs text-destructive font-semibold">
              {error}
            </p>
          ) : null}

          <div className="space-y-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="h-12 min-h-[48px] w-full rounded-full font-medium"
              loading={isSubmitting}
              loadingText="Verifying code..."
            >
              Verify & Complete Sign In
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMfaChallenge(null);
                clearError();
              }}
              className="w-full rounded-full font-medium h-10"
            >
              Back to Login
            </Button>
          </div>
        </form>

        <AuthFooterExtras action="signing in" mode="login" />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div>
        <h1 className={authHeadingClassName}>Welcome back</h1>
        <p className={authSubtextClassName}>
          or{" "}
          <Link href="/register" className={authLinkClassName}>
            Create an account for your Susu
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className={authLabelClassName}>
            Email address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            className={authInputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className={authLabelClassName}>
              Password <span className="text-destructive">*</span>
            </label>
            <Link href="/contact" className={authLinkClassName}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={cn(authInputClassName, "pr-10")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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

        <label className="flex cursor-pointer items-center gap-2.5 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-border/70 text-secondary focus:ring-primary/20"
          />
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Remember me on this device
          </span>
        </label>

        {successMessage ? (
          <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs sm:text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold border border-emerald-500/20">
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{successMessage}</span>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-xs sm:text-sm text-destructive font-semibold border border-destructive/20">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full rounded-full font-medium"
          loading={isSubmitting}
          loadingText="Logging in..."
          disabled={!!successMessage}
        >
          Sign In
        </Button>
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
