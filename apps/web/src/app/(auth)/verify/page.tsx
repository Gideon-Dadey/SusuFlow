"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { authInputClassName } from "@/components/auth/auth-form-ui";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const { tenantSlug, setTenantSlug } = useAuthStore();
  const [tenant, setTenant] = useState(tenantSlug);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [status, setStatus] = useState<{
    emailVerified: boolean;
    phoneVerified: boolean;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId || !tenant) return;
    setTenantSlug(tenant);
    authApi
      .verificationStatus(userId, tenant)
      .then(setStatus)
      .catch(() => undefined);
  }, [userId, tenant, setTenantSlug]);

  const sendCode = async (channel: "email" | "phone") => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authApi.sendOtp(userId, channel, tenant);
      setMessage(res.message || `Code sent via ${channel}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (channel: "email" | "phone", code: string) => {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await authApi.verifyOtp(userId, channel, code, tenant);
      setStatus({
        emailVerified: res.emailVerified,
        phoneVerified: res.phoneVerified,
      });
      setMessage(res.message);
      if (res.accountActive) {
        router.push("/login?verified=1");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <AuthShell>
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Verify account</h1>
          <p className="text-sm text-muted-foreground">
            Missing user reference.
          </p>
        </div>
        <p className="text-sm text-slate-600">
          Register first, then open the verification link from your email.
        </p>
        <Link
          href="/register"
          className="mt-4 inline-block text-sm font-medium text-emerald-700"
        >
          Go to registration
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Verify your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the codes sent to your email and phone to activate your savings
          account.
        </p>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Susu company slug
          <input
            className={authInputClassName}
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            placeholder="adipa"
          />
        </label>

        {status && (
          <p className="text-sm text-slate-600">
            Email: {status.emailVerified ? "Verified" : "Pending"} · Phone:{""}
            {status.phoneVerified ? "Verified" : "Pending"}
          </p>
        )}

        <div className="space-y-2 rounded-none border border-border/60 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Email verification
          </p>
          <input
            className={authInputClassName}
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
            placeholder="6-digit code"
            inputMode="numeric"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => sendCode("email")}
            >
              Resend email code
            </Button>
            <Button
              type="button"
              disabled={loading || !emailCode}
              onClick={() => verify("email", emailCode)}
            >
              Verify email
            </Button>
          </div>
        </div>

        <div className="space-y-2 rounded-none border border-border/60 p-4">
          <p className="text-sm font-semibold text-slate-800">
            Phone verification
          </p>
          <input
            className={authInputClassName}
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            placeholder="6-digit code"
            inputMode="numeric"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => sendCode("phone")}
            >
              Resend SMS code
            </Button>
            <Button
              type="button"
              disabled={loading || !phoneCode}
              onClick={() => verify("phone", phoneCode)}
            >
              Verify phone
            </Button>
          </div>
        </div>

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-center text-sm text-slate-500">
          Already verified?{""}
          <Link href="/login" className="font-medium text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
