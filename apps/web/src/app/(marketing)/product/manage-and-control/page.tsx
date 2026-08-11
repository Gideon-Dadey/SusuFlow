import type { Metadata } from "next";
import {
  CalendarClock,
  Layers,
  ShieldCheck,
  UserCog,
  Wallet,
} from "@/components/icons/phosphor";
import {
  ProductCrossLinks,
  ProductFeatureSplit,
  ProductPageHero,
  ProductStatsBand,
} from "@/components/marketing/product/ofx-product-page";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Manage & Control | ${APP_NAME}`,
  description:
    "Secure your entire microfinance operation with multi-level approvals, branch management, and custom saving plans.",
};

const SAGE = "var(--ofx-sage)";

/** Approvals queue with a floating dual sign-off chip. */
function ControlHeroMock() {
  const requests = [
    {
      label: "Payout · GHS 2,400.00",
      meta: "Accra Central",
      status: "Pending",
      pending: true,
    },
    {
      label: "Ledger adjustment",
      meta: "Kumasi branch",
      status: "Pending",
      pending: true,
    },
    {
      label: "New collector access",
      meta: "Takoradi branch",
      status: "Approved",
      pending: false,
    },
  ];

  return (
    <div className="relative w-full max-w-sm">
      <div className="ofx-card p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            Approvals queue
          </p>
          <span className="rounded-full bg-[var(--ofx-cream-deep)] px-2.5 py-1 text-[11px] font-semibold text-foreground">
            2 pending
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {requests.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-2xl bg-[var(--ofx-cream)] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.meta}</p>
              </div>
              <span
                className={
                  r.pending
                    ? "text-xs font-semibold text-[var(--ofx-flame)]"
                    : "text-xs font-semibold text-emerald-700"
                }
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-full bg-[var(--ofx-ink)] py-2.5 text-center text-xs font-semibold text-white">
          Review requests
        </div>
      </div>

      <div className="absolute -bottom-7 -left-4 w-56 rounded-2xl border border-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,27,23,0.4)] sm:-left-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ofx-cream-deep)]">
            <ShieldCheck className="h-4 w-4 text-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              Dual sign-off
            </p>
            <p className="text-xs text-muted-foreground">2 of 2 approved</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Branch performance rows with progress bars. */
function BranchMock() {
  const branches = [
    { name: "Accra Central", value: "GHS 8,420", pct: 84 },
    { name: "Kumasi", value: "GHS 6,150", pct: 62 },
    { name: "Takoradi", value: "GHS 4,890", pct: 49 },
  ];

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <p className="text-sm font-semibold text-foreground">
        Branch performance
      </p>
      <p className="text-xs text-muted-foreground">Collections vs target</p>
      <div className="mt-5 space-y-4">
        {branches.map((b) => (
          <div key={b.name}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{b.name}</span>
              <span className="font-semibold text-foreground">{b.value}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--ofx-cream-deep)]">
              <div
                className="h-full rounded-full bg-[var(--ofx-flame)]"
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Roles and permissions card with toggle pills. */
function RolesMock() {
  const roles = [
    { role: "Manager", perm: "Approve payouts", on: true },
    { role: "Teller", perm: "Record deposits", on: true },
    { role: "Collector", perm: "Adjust ledgers", on: false },
  ];

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ofx-sage)]">
          <UserCog className="h-5 w-5 text-foreground" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Roles & permissions
          </p>
          <p className="text-xs text-muted-foreground">Control Hub</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {roles.map((r) => (
          <div
            key={r.role}
            className="flex items-center justify-between rounded-2xl bg-[var(--ofx-cream)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{r.role}</p>
              <p className="text-xs text-muted-foreground">{r.perm}</p>
            </div>
            <span
              className={
                r.on
                  ? "flex h-5 w-9 items-center justify-end rounded-full bg-[var(--ofx-ink)] p-0.5"
                  : "flex h-5 w-9 items-center justify-start rounded-full bg-[var(--ofx-cream-deep)] p-0.5"
              }
            >
              <span className="size-4 rounded-full bg-white shadow-sm" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Savings plan cards with rates and cadence. */
function PlansMock() {
  const plans = [
    { name: "Daily 20", meta: "GHS 20 / day · commission auto-deducted" },
    { name: "Market Weekly", meta: "GHS 100 / week · SMS reminders" },
    { name: "Trader Loan", meta: "Repay GHS 15 / day with deposits" },
  ];

  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-[var(--ofx-sage)]">
          <CalendarClock className="h-5 w-5 text-foreground" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Saving plans</p>
          <p className="text-xs text-muted-foreground">3 active products</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className="rounded-2xl bg-[var(--ofx-cream)] px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManageAndControlPage() {
  return (
    <>
      <ProductPageHero
        eyebrow="Manage & Control"
        title="Become the world's most relaxed operations manager."
        lead="Stop worrying about who edited a ledger or which branch is underperforming. Set strict controls, mandate approvals, and scale your Susu operations with absolute confidence."
        tile={SAGE}
        mock={<ControlHeroMock />}
        secondaryCta={{ label: "See how it works", href: "/how-it-works" }}
      />

      <ProductFeatureSplit
        background="paper"
        eyebrow="Branch management"
        title="Multi-Branch Management"
        paragraphs={[
          "Operating across multiple markets or regions? SusuFlow lets you effortlessly oversee your entire geographic footprint from a single, unified admin dashboard.",
          "Assign staff to specific branches, set distinct collection targets per market, and compare performance across your network. Maintain high-level oversight without getting bogged down in localized admin tasks.",
        ]}
        bullets={[
          "One dashboard for every branch",
          "Per-market collection targets",
          "Network-wide performance comparisons",
        ]}
        link={{
          label: "Built for susu companies & MFIs",
          href: "/why-susuflow/susu-companies-and-mfis",
        }}
        tile={SAGE}
        mock={<BranchMock />}
      />

      <ProductFeatureSplit
        background="cream"
        flip
        eyebrow="Control hub"
        title="Control Hub & Approvals"
        paragraphs={[
          "Internal fraud and accidental errors cost Susu companies millions of cedis annually. Our Control Hub implements strict access controls and role-based permissions to protect your ledgers.",
          "Configure custom approval workflows for payouts, large deposits, or ledger adjustments. Ensure that no significant financial action happens without dual sign-off from authorized managers.",
        ]}
        bullets={[
          "Role-based access controls",
          "Custom approval workflows",
          "Dual sign-off on every big move",
        ]}
        link={{
          label: "Explore role-based approvals",
          href: "/why-susuflow/role-based-approvals",
        }}
        tile={SAGE}
        mock={<RolesMock />}
      />

      <ProductFeatureSplit
        background="paper"
        eyebrow="Saving plans"
        title="Flexible Savings & Loan Plans"
        paragraphs={[
          "Move beyond one-size-fits-all products. SusuFlow allows you to easily configure dynamic daily, weekly, or monthly savings plans tailored to your community's unique financial goals.",
          "Automatically deduct daily platform fees or commissions, and effortlessly manage micro-loan repayments integrated directly into the saver's daily deposit flow.",
        ]}
        bullets={[
          "Daily, weekly or monthly cadences",
          "Automatic fees and commissions",
          "Loan repayments inside the deposit flow",
        ]}
        link={{ label: "See plans and pricing", href: "/pricing" }}
        tile={SAGE}
        mock={<PlansMock />}
      />

      <ProductStatsBand
        background="cream"
        title="Rules you set once. Enforced every day."
        lead="Give every branch, role and payout a clear rulebook — then let the platform hold the line while you focus on growth."
        stats={[
          { value: "1", label: "Dashboard for your entire branch network" },
          { value: "2-step", label: "Sign-off on payouts and adjustments" },
          { value: "100%", label: "Of financial actions logged and traceable" },
          { value: "0", label: "Unauthorized ledger edits" },
        ]}
      />

      <ProductCrossLinks
        background="paper"
        links={[
          {
            title: "Accounts & Payments",
            description:
              "Digital susu accounts, instant MoMo payouts and a cash-free app for field collectors.",
            href: "/product/accounts-and-payments",
            tile: "var(--ofx-sand)",
            icon: Wallet,
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
