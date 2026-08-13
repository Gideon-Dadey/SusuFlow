import Link from "next/link";
import { X } from "@/components/icons/phosphor";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { AuthBlobVisual } from "@/components/auth/auth-blob-visual";

export function AuthShell({
  children,
  wideForm = false,
  visualTone = "sage",
  visualTagline = "Every cedi verified. Every saver in the loop.",
}: {
  children: React.ReactNode;
  wideForm?: boolean;
  visualTone?: "sage" | "sand" | "sky";
  visualTagline?: string;
}) {
  void visualTone;

  return (
    <div className="auth-page-root auth-ofx !bg-[var(--ofx-cream)]">
      <div className="auth-page-card">
        <div
          className={`auth-page-form-column overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${wideForm ? "auth-page-form-column--wide" : ""}`}
        >
          <Link
            href="/"
            className="absolute right-6 top-12 z-10 inline-flex size-8 items-center justify-center text-foreground/40 transition-all hover:scale-110 hover:text-foreground lg:hidden"
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
          className={`auth-page-visual bg-[#111111] ${wideForm ? "auth-page-visual--narrow" : ""}`}
        >
          <AuthBlobVisual tagline={visualTagline} />
        </div>
      </div>
    </div>
  );
}
