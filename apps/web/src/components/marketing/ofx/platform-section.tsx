import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Users,
  Wallet,
} from "@/components/icons/phosphor";
import { MarketingContainer } from "../marketing-container";

/** Framed dashboard mock inside a large rounded panel. */
function PlatformMock() {
  const rows = [
    {
      label: "MoMo deposits",
      value: "GHS 8,940.00",
      meta: "142 verified today",
      icon: BadgeCheck,
    },
    {
      label: "Member balances",
      value: "GHS 402,118.50",
      meta: "1,860 active savers",
      icon: Users,
    },
    {
      label: "Pending payouts",
      value: "GHS 12,300.00",
      meta: "4 awaiting approval",
      icon: Wallet,
    },
  ];

  return (
    <div className="ofx-card mx-auto max-w-4xl p-5 sm:p-8" aria-hidden>
      <div className="flex items-center justify-between border-b border-border/70 pb-5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 bg-[var(--ofx-flame)]" />
          <span className="size-2.5 bg-[var(--ofx-sand)]" />
          <span className="size-2.5 bg-[var(--ofx-sage)]" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          SusuFlow · Control Hub
        </p>
      </div>
      <div className="grid gap-4 pt-6 sm:grid-cols-3">
        {rows.map(({ label, value, meta, icon: Icon }) => (
          <div key={label} className="bg-[var(--ofx-cream)] p-5 text-left">
            <span className="flex size-9 items-center justify-center bg-white">
              <Icon className="h-4 w-4 text-foreground" aria-hidden />
            </span>
            <p className="mt-4 text-[13px] font-medium text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OfxPlatformSection() {
  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section text-center">
        <h2 className="ofx-h2 mx-auto max-w-3xl">
          Control everything. See everything.
          <br />
          All in one place.
        </h2>
        <p className="ofx-lead mx-auto mt-5 max-w-2xl">
          Forget juggling notebooks, cash floats and scattered spreadsheets. Get
          every collector, member and cedi into one streamlined platform that
          does it all for you.
        </p>
        <div className="mt-8">
          <Link
            href="/product/manage-and-control"
            className="ofx-btn ofx-btn-dark"
          >
            Explore the Control Hub
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-14">
          <PlatformMock />
        </div>
      </MarketingContainer>
    </section>
  );
}
