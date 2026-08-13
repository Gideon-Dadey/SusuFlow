"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Send,
  ShieldCheck,
  Smartphone,
  Wallet,
  type Icon,
} from "@/components/icons/phosphor";
import {
  HOW_IT_WORKS_DIGITAL_COLLECTOR,
  HOW_IT_WORKS_GHANIAN_MARKET,
  VALUES_IMAGE_GROWTH,
  VALUES_IMAGE_TRANSPARENCY,
} from "@/lib/brand-assets";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";
import { MicroLabel } from "./micro-label";

type OfferTab = {
  id: string;
  label: string;
  title: string;
  href: string;
  image: string;
  imageAlt: string;
  features: { icon: Icon; title: string; body: string }[];
  overlays: { kicker: string; value: string; note: string }[];
};

const TABS: OfferTab[] = [
  {
    id: "momo",
    label: "MoMo Deposits",
    title: "MoMo Deposits",
    href: "/product/accounts-and-payments",
    image: HOW_IT_WORKS_GHANIAN_MARKET,
    imageAlt: "A trader completing a susu contribution by Mobile Money",
    features: [
      {
        icon: Wallet,
        title: "Members pay from their own wallet.",
        body: "MTN MoMo, Telecel Cash and AT Money land through the gateway. Cash never has to change hands at the stall.",
      },
      {
        icon: ShieldCheck,
        title: "Nothing hits the books until it clears.",
        body: "The ledger credits a balance only after Hubtel confirms success. Disputed receipts stop before they start.",
      },
      {
        icon: Send,
        title: "Collectors send a prompt, not a demand.",
        body: "Field staff trigger a payment request. The member approves on their phone. Both sides get the same reference.",
      },
      {
        icon: CheckCircle2,
        title: "Instant proof for the saver and the company.",
        body: "SMS and in app receipts share one truth. Management sees the same cedi the member just paid.",
      },
    ],
    overlays: [
      { kicker: "Gateway", value: "GHS 50.00", note: "Deposit verified" },
      { kicker: "Reference", value: "SF 8F2K19", note: "MTN MoMo · Hubtel" },
    ],
  },
  {
    id: "collector",
    label: "Collector App",
    title: "Collector App",
    href: "/product/accounts-and-payments",
    image: HOW_IT_WORKS_DIGITAL_COLLECTOR,
    imageAlt:
      "A field collector helping a saver complete a Mobile Money deposit",
    features: [
      {
        icon: Smartphone,
        title: "The stall is the branch.",
        body: "Onboard members, pull up balances and send MoMo prompts from a phone. No notebook, no float.",
      },
      {
        icon: CheckCircle2,
        title: "Daily targets sit on the home screen.",
        body: "Collectors see what they owe the day, not a spreadsheet at night. Supervisors see the same numbers live.",
      },
      {
        icon: ShieldCheck,
        title: "Cash never sits in a collector's pocket.",
        body: "The workflow is cashless by default. That removes the biggest source of susu fraud.",
      },
      {
        icon: Lock,
        title: "Every action leaves a trail.",
        body: "Who prompted, who paid, which reference cleared. Audits start from the field, not from memory.",
      },
    ],
    overlays: [
      {
        kicker: "Today",
        value: "42 collections",
        note: "Target 40 · On track",
      },
      { kicker: "Last prompt", value: "Paid", note: "Ama Boateng · 2 min ago" },
    ],
  },
  {
    id: "control",
    label: "Control Hub",
    title: "Control Hub",
    href: "/product/manage-and-control",
    image: VALUES_IMAGE_TRANSPARENCY,
    imageAlt: "An operations manager reviewing a live susu ledger",
    features: [
      {
        icon: Lock,
        title: "Roles match how the company actually runs.",
        body: "Collectors, clerks, branch managers and directors see only what their job needs. Nothing more.",
      },
      {
        icon: ShieldCheck,
        title: "Payouts wait for the right sign off.",
        body: "Large withdrawals and plan changes cannot move on one person's click. Dual control is the default.",
      },
      {
        icon: Wallet,
        title: "Every branch, one login.",
        body: "Kumasi and Accra targets, staff and ledgers live in one hub. Head office does not chase WhatsApp.",
      },
      {
        icon: CheckCircle2,
        title: "Rules you set once, enforced every day.",
        body: "The platform holds the line while you grow collectors, not clerks.",
      },
    ],
    overlays: [
      { kicker: "Approval", value: "Waiting", note: "Withdrawal · GHS 4,200" },
      { kicker: "Signed by", value: "Director", note: "Dual control on" },
    ],
  },
  {
    id: "ledger",
    label: "Ledger",
    title: "Ledger & Reports",
    href: "/product/platform-capabilities",
    image: VALUES_IMAGE_GROWTH,
    imageAlt: "A modern susu office using digital tools",
    features: [
      {
        icon: ShieldCheck,
        title: "Double entry behind every balance.",
        body: "Credits and debits stay in lockstep with the gateway. Midnight reconciliation becomes a download.",
      },
      {
        icon: CheckCircle2,
        title: "Exports your auditor will actually open.",
        body: "Trial balances, receipts and activity logs in PDF or CSV. Reference linked, not typed up.",
      },
      {
        icon: Wallet,
        title: "Liquidity you can trust at noon.",
        body: "Declared cash matches the corporate wallet because the books never move first.",
      },
      {
        icon: Send,
        title: "Live view for accountants and boards.",
        body: "No waiting for month end packs. Management sees the same ledger the field just wrote.",
      },
    ],
    overlays: [
      { kicker: "Books", value: "Balanced", note: "Debits = credits" },
      {
        kicker: "Today in",
        value: "GHS 18,640",
        note: "124 verified deposits",
      },
    ],
  },
  {
    id: "payouts",
    label: "Payouts",
    title: "Payouts & Approvals",
    href: "/product/manage-and-control",
    image: VALUES_IMAGE_TRANSPARENCY,
    imageAlt: "Staff reviewing verified deposits and payouts",
    features: [
      {
        icon: Send,
        title: "Pay out to the member's wallet.",
        body: "Approved amounts go to MTN, Telecel or AT. No bulk cash on a market day.",
      },
      {
        icon: Lock,
        title: "Sign off before a cedi leaves.",
        body: "Role based approvals sit in front of every payout. Honest staff get a clean log. Bad actors lose the gap.",
      },
      {
        icon: ShieldCheck,
        title: "One request, full history.",
        body: "Who asked, who approved, which reference settled. Disputes end at the record.",
      },
      {
        icon: CheckCircle2,
        title: "Members see the money, not a promise.",
        body: "The same confirmation that protects the company is the receipt the saver can show.",
      },
    ],
    overlays: [
      { kicker: "Payout", value: "GHS 1,200", note: "Sent to MTN wallet" },
      { kicker: "Control", value: "Approved", note: "2 of 2 sign offs" },
    ],
  },
];

export function ProductOfferSection() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((tab) => tab.id === activeId) ?? TABS[0];

  return (
    <section className="product-offer bg-[#212121] py-16 text-white md:py-28">
      <MarketingContainer>
        <div className="mx-auto max-w-3xl text-center">
          <MicroLabel onPhoto className="justify-center">
            What we offer
          </MicroLabel>
          <h2 className="omnih-h2 mt-4 text-white">
            What companies get from SusuFlow.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Verified collections, cashless field work, a ledger that balances,
            and payouts that wait for the right people. One platform for the
            susu company.
          </p>
        </div>

        <div
          className="offer-pill mx-auto mt-10 flex w-fit max-w-full items-center justify-center gap-1 overflow-x-auto border border-white/20 bg-[#2b2b2b] p-1"
          role="tablist"
          aria-label="SusuFlow product areas"
        >
          {TABS.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                id={`offer-tab-${tab.id}`}
                aria-controls={`offer-panel-${tab.id}`}
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "offer-pill shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors sm:px-5",
                  selected
                    ? "bg-black text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`offer-panel-${active.id}`}
          role="tabpanel"
          aria-labelledby={`offer-tab-${active.id}`}
          className="mt-6 grid gap-4 lg:grid-cols-2 lg:gap-5"
        >
          <div className="offer-card offer-copy flex flex-col bg-[#2b2b2b] p-6 sm:p-8 lg:p-10">
            <h3 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
              {active.title}
            </h3>
            <ul className="mt-8 flex flex-1 flex-col gap-6">
              {active.features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex gap-4">
                    <span className="offer-icon mt-0.5 flex size-10 shrink-0 items-center justify-center bg-[#3a3a3a] text-white">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-white">{feature.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">
                        {feature.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="offer-btn inline-flex items-center justify-center bg-black px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-neutral-950"
              >
                Get started for free
              </Link>
              <Link
                href={active.href}
                className="offer-btn inline-flex items-center justify-center bg-black px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-neutral-950"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="offer-card relative min-h-[22rem] overflow-hidden bg-[#1a1a1a] lg:min-h-full">
            <Image
              src={active.image}
              alt={active.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3 sm:inset-x-8 sm:bottom-8">
              {active.overlays.map((overlay) => (
                <div
                  key={overlay.value}
                  className="offer-chip flex items-center justify-between gap-4 bg-black/85 px-4 py-3 backdrop-blur-md"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                      {overlay.kicker}
                    </p>
                    <p className="mt-1 text-base font-semibold text-white">
                      {overlay.value}
                    </p>
                  </div>
                  <p className="text-right text-sm text-white/70">
                    {overlay.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
