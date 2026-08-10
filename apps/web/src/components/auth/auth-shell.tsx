import Link from "next/link";
import { BadgeCheck, X } from "lucide-react";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { APP_NAME } from "@/lib/marketing-data";

type AuthVisualTone = "sage" | "sand" | "sky";

const TONE_BACKGROUNDS: Record<AuthVisualTone, string> = {
  sage: "var(--ofx-sage)",
  sand: "var(--ofx-sand)",
  sky: "var(--ofx-sky)",
};

/** Stylized mock-UI card for the auth visual column (divs only, no imagery). */
function AuthProductMock() {
  const rows = [
    { label: "Mon · GHS 20.00" },
    { label: "Tue · GHS 20.00" },
    { label: "Wed · GHS 20.00" },
  ];

  return (
    <div className="w-full max-w-[300px]" aria-hidden>
      <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              My susu balance
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              GHS 1,240.00
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ofx-cream-deep)] px-2.5 py-1 text-[11px] font-semibold text-foreground">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Verified
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-[11px] font-semibold text-emerald-700">
                Verified
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--ofx-cream-deep)]">
          <div className="h-full w-3/4 rounded-full bg-[var(--ofx-flame)]" />
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  children,
  wideForm = false,
  visualTone = "sage",
  visualTagline = "Every cedi verified. Every saver in the loop.",
}: {
  children: React.ReactNode;
  wideForm?: boolean;
  visualTone?: AuthVisualTone;
  visualTagline?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="auth-page-root auth-ofx !bg-[var(--ofx-cream)]">
      <div className="auth-page-card">
        <div
          className={`auth-page-form-column overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${wideForm ? "auth-page-form-column--wide" : ""}`}
        >
          <Link
            href="/"
            className="absolute right-6 top-12 z-10 inline-flex size-8 items-center justify-center text-foreground/40 transition-all hover:scale-110 hover:text-foreground lg:right-4 lg:top-4"
            aria-label="Back to home"
          >
            <X className="h-5 w-5" />
          </Link>

          <div className="auth-page-form-inner">
            <div className="mb-6 lg:hidden">
              <BrandLockup priority wordmarkClassName="text-xl" />
            </div>
            <div className="w-full animate-fade-in">{children}</div>
          </div>
        </div>

        <div
          className={`auth-page-visual bg-[var(--ofx-cream)] ${wideForm ? "auth-page-visual--narrow" : ""}`}
        >
          <div
            className="relative flex h-full w-full flex-col justify-between p-8 text-foreground xl:p-12"
            style={{ backgroundColor: TONE_BACKGROUNDS[visualTone] }}
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <BrandLockup priority wordmarkClassName="text-2xl" />
            </div>
            <div className="relative z-10 flex flex-1 items-center justify-center py-10">
              <AuthProductMock />
            </div>
            <div className="relative z-10 space-y-3">
              <p className="ofx-h3 max-w-sm">{visualTagline}</p>
              <p className="text-sm text-foreground/60">
                © {year} {APP_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
