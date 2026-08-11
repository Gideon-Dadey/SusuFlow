import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { MarketingContainer } from "../marketing-container";

export function OfxSaversBandSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <div className="grid overflow-hidden rounded-[2rem] bg-[var(--ofx-sky)] lg:grid-cols-[1.2fr_1fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <p className="ofx-eyebrow">For individual savers</p>
            <h2 className="ofx-h2 mt-4">
              Fast, secure, verified contributions for savers too.
            </h2>
            <p className="ofx-body mt-4 max-w-lg text-foreground/70">
              New to digital susu? Join your company online in minutes, deposit
              from your own MoMo wallet, and watch your balance grow with a
              receipt for every single payment. No waiting for updates from
              anyone.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/register" className="ofx-btn ofx-btn-dark">
                Join your susu
              </Link>
              <Link href="/how-it-works" className="ofx-link">
                How it works
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div
            className="relative hidden items-center justify-center p-10 lg:flex"
            aria-hidden
          >
            <div className="w-full max-w-[260px] rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
              <p className="text-xs font-medium text-muted-foreground">
                My susu balance
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                GHS 1,240.00
              </p>
              <div className="mt-5 space-y-3">
                {["Mon", "Tue", "Wed"].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {day} · GHS 20.00
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
