import type { Metadata } from "next";
import {
  BadgeCheck,
  Layers,
  MapPin,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  ProductCrossLinks,
  ProductFeatureSplit,
  ProductPageHero,
  ProductStatsBand,
} from "@/components/marketing/product/ofx-product-page";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Accounts, Payments & Cards | ${APP_NAME}`,
  description:
    "Collect, hold and manage daily Susu savings with 100% gateway verification and automated MoMo payouts.",
};

const SAND = "var(--ofx-sand)";

/** Member account card with verified deposits + floating SMS receipt chip. */
function AccountsHeroMock() {
  const deposits = [
    { day: "Today", plan: "Daily susu", amount: "GHS 20.00" },
    { day: "Yesterday", plan: "Daily susu", amount: "GHS 20.00" },
    { day: "Thu", plan: "Top-up", amount: "GHS 50.00" },
  ];

  return (
    <div className="relative w-full max-w-sm">
      <div className="ofx-card p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">
              Akosua Mensah · Daily susu
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
              GHS 1,240.00
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ofx-sage)] px-3 py-1.5 text-xs font-semibold text-foreground">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Up to date
          </span>
        </div>
        <div className="mt-6 space-y-3 border-t border-border/70 pt-5">
          {deposits.map((d) => (
            <div key={d.day} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{d.day}</p>
                <p className="text-xs text-muted-foreground">{d.plan}</p>
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

      <div className="absolute -bottom-7 -left-4 w-56 rounded-2xl border border-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,27,23,0.4)] sm:-left-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ofx-cream-deep)]">
            <Smartphone className="h-4 w-4 text-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              SMS receipt sent
            </p>
            <p className="text-xs text-muted-foreground">
              GHS 20.00 · MTN MoMo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Passbook-to-digital: member balances with verified ticks. */
function AccountsListMock() {
  const members = [
    { name: "Abena Osei", balance: "GHS 860.00" },
    { name: "Kwame Mensah", balance: "GHS 2,140.00" },
    { name: "Efua Boateng", balance: "GHS 415.00" },
  ];

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <p className="text-sm font-semibold text-foreground">Member accounts</p>
      <p className="text-xs text-muted-foreground">Live balances · verified</p>
      <div className="mt-5 space-y-3">
        {members.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between rounded-2xl bg-[var(--ofx-cream)] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-foreground">
                {m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <p className="text-sm font-medium text-foreground">{m.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {m.balance}
              </p>
              <BadgeCheck
                className="h-4 w-4 text-[var(--ofx-flame)]"
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Payout approval card with dual sign-off. */
function PayoutMock() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ofx-sand)]">
          <Wallet className="h-5 w-5 text-foreground" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Payout request
          </p>
          <p className="text-xs text-muted-foreground">
            GHS 850.00 · MTN wallet
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-2.5 rounded-2xl bg-[var(--ofx-cream)] p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Manager</span>
          <span className="font-semibold text-emerald-700">Approved</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Director</span>
          <span className="font-semibold text-emerald-700">Approved</span>
        </div>
      </div>
      <div className="mt-5 rounded-full bg-[var(--ofx-ink)] py-2.5 text-center text-xs font-semibold text-white">
        Release payout
      </div>
    </div>
  );
}

/** Collector-in-the-field card: route, daily target, live prompt. */
function CollectorMock() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ofx-sand)]">
          <MapPin className="h-5 w-5 text-foreground" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Route · Makola Market
          </p>
          <p className="text-xs text-muted-foreground">42 of 60 stalls today</p>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">
            Daily target
          </span>
          <span className="font-semibold text-foreground">
            GHS 1,180 / 1,500
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--ofx-cream-deep)]">
          <div className="h-full w-[78%] rounded-full bg-[var(--ofx-flame)]" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--ofx-cream)] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Smartphone className="h-4 w-4 text-foreground" aria-hidden />
          <p className="text-xs font-medium text-foreground">
            Prompt sent · Ama A.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-700">
          GHS 30.00
        </span>
      </div>
    </div>
  );
}

export default function AccountsAndPaymentsPage() {
  return (
    <>
      <ProductPageHero
        eyebrow="Accounts & Payments"
        title="Modernize collection without losing offline trust."
        lead="Transition your entire Susu operation to a secure, cashless environment. Manage digital accounts, automate mobile money payouts, and empower your field collectors with real-time tools."
        tile={SAND}
        mock={<AccountsHeroMock />}
        secondaryCta={{ label: "See how it works", href: "/how-it-works" }}
      />

      <ProductFeatureSplit
        background="paper"
        eyebrow="Digital accounts"
        title="Digital Susu Accounts"
        paragraphs={[
          "Upgrade your savers from paper passbooks to real-time digital accounts. Every cedi deposited is instantly logged and verified against the gateway, ensuring 100% reconciliation and zero missing funds.",
          "Give your clients the peace of mind they deserve with SMS alerts for every transaction and clear, immutable balances that build trust and drive growth for your business.",
        ]}
        bullets={[
          "Every deposit verified against the gateway",
          "SMS alerts on every transaction",
          "Clear, immutable member balances",
        ]}
        link={{
          label: "See gateway verification",
          href: "/why-susuflow/gateway-verification",
        }}
        tile={SAND}
        mock={<AccountsListMock />}
      />

      <ProductFeatureSplit
        background="cream"
        flip
        eyebrow="MoMo payouts"
        title="Instant MoMo Payouts"
        paragraphs={[
          "When it's time for clients to cash out their savings, completely eliminate the risk of handling bulk cash. Push payouts directly to their MTN, Telecel, or AT wallets in seconds.",
          "Secure your cash flow with our robust dual sign-off system. Require management approval for large payouts, ensuring complete control over outbound funds while delivering instant liquidity to your savers.",
        ]}
        bullets={[
          "Payouts straight to MTN, Telecel & AT wallets",
          "Dual sign-off on large payouts",
          "No bulk cash risk, ever",
        ]}
        link={{
          label: "Explore payout approvals",
          href: "/why-susuflow/role-based-approvals",
        }}
        tile={SAND}
        mock={<PayoutMock />}
      />

      <ProductFeatureSplit
        background="paper"
        eyebrow="Collector app"
        title="Field Collector App"
        paragraphs={[
          "Equip your market agents with our dedicated mobile app. Say goodbye to easily lost notebooks and illegible handwriting. Collectors can instantly pull up client accounts, initiate deposits, and issue digital receipts.",
          "Track your agents in the field, monitor live collection targets, and guarantee that no collector handles cash unless authorized. Every collection is securely tethered to your central double-entry ledger.",
        ]}
        bullets={[
          "Digital receipts at the stall",
          "Live collection targets per agent",
          "Cash-free collection by default",
        ]}
        link={{
          label: "Meet the field collector app",
          href: "/why-susuflow/field-collectors",
        }}
        tile={SAND}
        mock={<CollectorMock />}
      />

      <ProductStatsBand
        background="cream"
        title="Cashless collection. Verified end to end."
        lead="Every contribution moves through the gateway, lands in the ledger and pings the member's phone — with nothing lost along the way."
        stats={[
          { value: "100%", label: "Deposits verified against the gateway" },
          { value: "3", label: "Mobile money networks supported" },
          { value: "24/7", label: "Collections, payouts and receipts" },
          { value: "0", label: "Cash floats for collectors to carry" },
        ]}
      />

      <ProductCrossLinks
        background="paper"
        links={[
          {
            title: "Manage & Control",
            description:
              "Branch oversight, approval workflows and flexible savings plans — run every branch from one hub.",
            href: "/product/manage-and-control",
            tile: "var(--ofx-sage)",
            icon: ShieldCheck,
          },
          {
            title: "Platform Capabilities",
            description:
              "Automated reconciliation, telco gateway integrations and live, auditor-ready reporting.",
            href: "/product/platform-capabilities",
            tile: "var(--ofx-sky)",
            icon: Layers,
          },
        ]}
      />
    </>
  );
}
