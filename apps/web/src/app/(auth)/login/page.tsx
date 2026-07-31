"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthFooterExtras,
  authInputClassName,
} from "@/components/auth/auth-form-ui";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const REMEMBER_EMAIL_KEY = "susuflow-remember-email";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantParam = searchParams.get("tenant") || "";
  const queryClient = useQueryClient();
  const { login, error, clearError, setTenantSlug, tenantSlug } =
    useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
      const path = await login(email, password, tenantParam || tenantSlug);
      setIsSubmitting(false);
      setSuccessMessage("You are logged in successfully");
      router.prefetch(path);
      window.setTimeout(() => {
        queryClient.clear();
        router.replace(path);
      }, 450);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div>
        <h1 className="sr-hero-title text-foreground">Login</h1>
        <p className="mt-2.5 text-base text-muted-foreground">
          or{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary/80"
          >
            Join your susu
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm sm:text-base font-semibold text-foreground"
          >
            Email address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            className={authInputClassName}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="password"
              className="text-sm sm:text-base font-semibold text-foreground"
            >
              Password <span className="text-destructive">*</span>
            </label>
            <Link
              href="/contact"
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
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

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded-none border-input text-secondary focus:ring-ring"
          />
          <span className="text-sm text-foreground">Remember me</span>
        </label>

        {successMessage ? (
          <p className="flex items-center gap-2 rounded-none bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4 shrink-0" aria-hidden />
            <span>{successMessage}</span>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-none bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-[54px] min-h-[54px] w-full rounded-[0.25rem] text-base font-bold shadow-[0_6px_20px_rgba(34,197,94,0.22)]"
          loading={isSubmitting}
          loadingText="Logging in..."
          disabled={!!successMessage}
        >
          Login
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
