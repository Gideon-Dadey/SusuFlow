"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Send,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "../marketing-container";

const TABS = [
  {
    id: "collections",
    label: "MoMo Collections",
    eyebrow: "SusuFlow MoMo Collections",
    title: "A simple end-to-end way to collect every contribution",
    body: "Members pay straight from their own Mobile Money wallet. Every deposit is confirmed against the payment gateway before it touches your ledger — no disputed receipts, no manual reconciliation.",
    cta: {
      label: "Explore collections",
      href: "/product/accounts-and-payments",
    },
    tile: "var(--ofx-sand)",
    icon: Smartphone,
    points: [
      "Gateway-verified deposits",
      "Instant member receipts",
      "Automatic reconciliation",
    ],
  },
  {
    id: "collector-app",
    label: "Collector App",
    eyebrow: "SusuFlow Collector App",
    title: "100% cashless collectors. Zero notebook disputes.",
    body: "Our collector workflow has rewritten the rules. Onboard members at the stall, send MoMo prompts in the field, and track every collection with total visibility — cash never changes hands.",
    cta: {
      label: "See the collector app",
      href: "/product/accounts-and-payments",
    },
    tile: "var(--ofx-sage)",
    icon: Send,
    points: [
      "Prompts sent in the field",
      "Live collection tracking",
      "Commission automation",
    ],
  },
  {
    id: "control",
    label: "Control Hub",
    eyebrow: "SusuFlow Control Hub",
    title: "Become the world's most relaxed operations manager",
    body: "Approvals, roles, branch budgets and access rights in one hub. Set clear rules for segregating duties, payout approvals and account access — then let the platform enforce them.",
    cta: {
      label: "Explore the Control Hub",
      href: "/product/manage-and-control",
    },
    tile: "var(--ofx-sky)",
    icon: ShieldCheck,
    points: [
      "Role-based approvals",
      "Segregation of duties",
      "Branch-level settings",
    ],
  },
  {
    id: "ledger",
    label: "Ledger & Reports",
    eyebrow: "SusuFlow Ledger",
    title: "Bank-grade books without the back office",
    body: "Double-entry accounting, exportable reports and reference-linked receipts give management and accountants the visibility they need for audits, reviews and daily operations.",
    cta: {
      label: "Explore the ledger",
      href: "/product/platform-capabilities",
    },
    tile: "var(--ofx-lilac)",
    icon: BookOpenCheck,
    points: [
      "Double-entry ledger",
      "Auditor-ready exports",
      "Reference per transaction",
    ],
  },
  {
    id: "payouts",
    label: "Payouts & Approvals",
    eyebrow: "SusuFlow Payouts",
    title: "Automate your approval workflows",
    body: "Tailored approval workflows for deposits, payouts and staff access ensure every cedi moves with accountability. Staff review requests with full history before funds are released.",
    cta: { label: "See payout workflows", href: "/product/manage-and-control" },
    tile: "var(--ofx-sand)",
    icon: BadgeCheck,
    points: [
      "Multi-step sign-offs",
      "Full request history",
      "Wallet-direct payouts",
    ],
  },
] as const;

export function OfxProductTabsSection() {
  const [activeId, setActiveId] = useState<(typeof TABS)[number]["id"]>(
    TABS[0].id,
  );
  const active = TABS.find((t) => t.id === activeId)!;
  const Icon = active.icon;

  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <h2 className="ofx-h2 mx-auto max-w-3xl text-center">
          A simple end-to-end solution to help your susu company thrive
        </h2>
        <p className="ofx-lead mx-auto mt-5 max-w-2xl text-center">
          Get the tools you need in one platform. With just a few clicks, you
          can digitize everything — collections, approvals, ledgers, payouts and
          so much more.
        </p>

        <div
          className="mt-12 flex flex-wrap justify-center gap-2.5"
          role="tablist"
          aria-label="Product areas"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === activeId}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "pill rounded-full border px-5 py-2.5 text-[15px] font-medium transition-colors",
                tab.id === activeId
                  ? "border-[var(--ofx-ink)] bg-[var(--ofx-ink)] text-white"
                  : "border-border bg-white text-foreground hover:bg-[var(--ofx-cream-deep)]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid items-center gap-10 rounded-[2rem] border border-border/70 bg-white p-8 sm:p-12 lg:grid-cols-2 lg:gap-14">
          <div>
            <p className="ofx-eyebrow">{active.eyebrow}</p>
            <h3 className="ofx-h3 mt-4 text-[1.6rem] sm:text-[2rem]">
              {active.title}
            </h3>
            <p className="ofx-body mt-4">{active.body}</p>
            <ul className="mt-6 space-y-2.5">
              {active.points.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2.5 text-[15px] font-medium text-foreground"
                >
                  <BadgeCheck
                    className="h-[18px] w-[18px] shrink-0 text-[var(--ofx-flame)]"
                    aria-hidden
                  />
                  {point}
                </li>
              ))}
            </ul>
            <Link href={active.cta.href} className="ofx-link mt-8 inline-flex">
              {active.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div
            className="flex min-h-[260px] items-center justify-center rounded-[1.5rem] p-8 sm:min-h-[320px]"
            style={{ backgroundColor: active.tile }}
            aria-hidden
          >
            <div className="w-full max-w-xs rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
              <span className="flex size-11 items-center justify-center rounded-full bg-[var(--ofx-cream)]">
                <Icon className="h-5 w-5 text-foreground" aria-hidden />
              </span>
              <p className="mt-4 text-base font-semibold text-foreground">
                {active.label}
              </p>
              <div className="mt-4 space-y-2.5">
                <div className="h-2 w-full rounded-full bg-[var(--ofx-cream-deep)]" />
                <div className="h-2 w-5/6 rounded-full bg-[var(--ofx-cream-deep)]" />
                <div className="h-2 w-2/3 rounded-full bg-[var(--ofx-cream-deep)]" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--ofx-cream)] px-4 py-3">
                <span className="text-xs font-medium text-muted-foreground">
                  Status
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
