import Link from "next/link";
import { ArrowRight, BadgeCheck, Smartphone } from "lucide-react";
import { MarketingContainer } from "../marketing-container";

/** Stylized product mock: balance card + verified deposits + MoMo prompt. */
function HeroProductMock() {
  const deposits = [
    { name: "Abena Osei", plan: "Daily susu", amount: "GHS 50.00" },
    { name: "Kwame Mensah", plan: "Market group", amount: "GHS 120.00" },
    { name: "Efua Boateng", plan: "Weekly susu", amount: "GHS 200.00" },
  ];

  const bars = [38, 62, 48, 74, 58, 88, 70];

  return (
    <div className="relative mx-auto w-full max-w-[540px]" aria-hidden>
      <div className="ofx-card p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)] sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              Total collections · Today
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              GHS 12,480.00
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ofx-sage)] px-3 py-1.5 text-xs font-semibold text-foreground">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            100% verified
          </span>
        </div>

        <div className="mt-6 flex h-24 items-end gap-2">
          {bars.map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-[var(--ofx-cream-deep)]"
              style={{ height: `${height}%` }}
            >
              <div
                className="w-full rounded-t-lg bg-[var(--ofx-flame)]"
                style={{ height: i >= 4 ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-border/70 pt-5">
          {deposits.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ofx-cream-deep)] text-xs font-semibold text-foreground">
                  {d.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {d.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{d.plan}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {d.amount}
                </p>
                <p className="text-[11px] font-medium text-emerald-700">
                  Verified
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-8 -left-4 w-56 rounded-2xl border border-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,27,23,0.4)] sm:-left-10">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ofx-sand)]">
            <Smartphone className="h-4 w-4 text-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              MoMo prompt sent
            </p>
            <p className="text-xs text-muted-foreground">Ama A. · GHS 30.00</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--ofx-cream-deep)]">
          <div className="h-full w-3/4 rounded-full bg-[var(--ofx-flame)]" />
        </div>
      </div>
    </div>
  );
}

export function OfxHeroSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="grid items-center gap-14 pb-20 pt-14 sm:pt-16 lg:grid-cols-2 lg:gap-10 lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <h1 className="ofx-display">
            One platform for your susu company. And every single cedi.
          </h1>
          <p className="ofx-lead mt-6">
            Reclaim time. Stop disputes. Run your susu company smarter with
            verified MoMo deposits, live ledgers and fast, secure payouts. All
            in one place.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/register" className="ofx-btn ofx-btn-dark ofx-btn-lg">
              Get started for free
            </Link>
            <Link href="/how-it-works" className="ofx-link">
              Take a tour
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="pb-8 lg:pb-0">
          <HeroProductMock />
        </div>
      </MarketingContainer>
    </section>
  );
}
