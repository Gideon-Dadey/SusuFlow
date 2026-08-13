import type { Metadata } from "next";
import {
  BadgeCheck,
  FileDown,
  MessageSquareText,
  Scale,
  ShieldCheck,
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
  title: `Platform Capabilities | ${APP_NAME}`,
  description:
    "Enterprise grade real time reconciliation, telecommunications gateway integrations, and live ledger exports.",
};

const SKY = "var(--ofx-sky)";

/** Trial balance card with a floating export-ready chip. */
function PlatformHeroMock() {
  const rows = [
    { account: "Member deposits", debit: "n/a", credit: "GHS 42,180.00" },
    { account: "MoMo float", debit: "GHS 42,180.00", credit: "n/a" },
    { account: "Commissions earned", debit: "n/a", credit: "GHS 1,240.00" },
  ];

  return (
    <div className="relative w-full max-w-sm">
      <div className="ofx-card p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Trial balance
            </p>
            <p className="text-xs text-muted-foreground">Live · Today</p>
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[var(--ofx-sage)] px-3 py-1.5 text-xs font-semibold text-foreground">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            Balanced
          </span>
        </div>
        <div className="mt-5 space-y-3 border-t border-border/70 pt-5">
          {rows.map((r) => (
            <div key={r.account} className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{r.account}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {r.debit !== "n/a" ? r.debit : r.credit}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between bg-[var(--ofx-cream)] px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">
            Debits = Credits
          </span>
          <span className="text-xs font-semibold text-emerald-700">
            GHS 43,420.00
          </span>
        </div>
      </div>

      <div className="absolute -bottom-7 -left-4 w-56 border border-border bg-white p-4 shadow-[0_24px_48px_-24px_rgba(28,27,23,0.4)] sm:-left-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center bg-[var(--ofx-cream-deep)]">
            <FileDown className="h-4 w-4 text-foreground" aria-hidden />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-foreground">
              Export ready
            </p>
            <p className="text-xs text-muted-foreground">trial-balance.csv</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ledger vs gateway matching rows. */
function ReconciliationMock() {
  const rows = [
    { ref: "48291037", amount: "GHS 20.00" },
    { ref: "58302148", amount: "GHS 120.00" },
    { ref: "69413259", amount: "GHS 50.00" },
  ];

  return (
    <div className="w-full max-w-sm border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <p className="text-sm font-semibold text-foreground">Ledger vs gateway</p>
      <p className="text-xs text-muted-foreground">Auto matched in real time</p>
      <div className="mt-5 space-y-3">
        {rows.map((r) => (
          <div
            key={r.ref}
            className="flex items-center justify-between bg-[var(--ofx-cream)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{r.ref}</p>
              <p className="text-xs text-muted-foreground">{r.amount}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck
                className="h-4 w-4 text-[var(--ofx-flame)]"
                aria-hidden
              />
              Matched
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Connected gateways list. */
function IntegrationsMock() {
  const gateways = [
    { name: "MTN MoMo", meta: "via Hubtel" },
    { name: "Telecel Cash", meta: "via Hubtel" },
    { name: "AT Money", meta: "via Hubtel" },
  ];

  return (
    <div className="w-full max-w-sm border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <p className="text-sm font-semibold text-foreground">Gateways</p>
      <p className="text-xs text-muted-foreground">Native integrations</p>
      <div className="mt-5 space-y-3">
        {gateways.map((g) => (
          <div
            key={g.name}
            className="flex items-center justify-between bg-[var(--ofx-cream)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.meta}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 bg emerald-600" />
              Connected
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2.5 bg-[var(--ofx-sky)] px-4 py-3">
        <MessageSquareText className="h-4 w-4 text-foreground" aria-hidden />
        <p className="text-xs font-medium text-foreground">
          {" "}
          SMS receipt fired · un spoofable{" "}
        </p>
      </div>
    </div>
  );
}

/** Exportable reports list. */
function ReportsMock() {
  const reports = [
    { name: "Trial balance", format: "PDF" },
    { name: "Audit log", format: "CSV" },
    { name: "Balance sheet", format: "PDF" },
  ];

  return (
    <div className="w-full max-w-sm border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
      <p className="text-sm font-semibold text-foreground">Reports</p>
      <p className="text-xs text-muted-foreground">One click exports</p>
      <div className="mt-5 space-y-3">
        {reports.map((r) => (
          <div
            key={r.name}
            className="flex items-center justify-between bg-[var(--ofx-cream)] px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <FileDown className="h-4 w-4 text-foreground" aria-hidden />
              <p className="text-sm font-medium text-foreground">{r.name}</p>
            </div>
            <span className="bg-white px-2.5 py-1 text-[11px] font-semibold text-foreground">
              {r.format}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 bg-[var(--ofx-ink)] py-2.5 text-center text-xs font-semibold text-white">
        Export all
      </div>
    </div>
  );
}

export default function PlatformCapabilitiesPage() {
  return (
    <>
      <ProductPageHero
        eyebrow="Platform Capabilities"
        title="Enterprise technology for microfinance operators."
        lead="Leverage deep integrations with Ghana's leading mobile networks, automated double entry accounting, and instant financial reporting to scale your business securely."
        tile={SKY}
        image="/marketing/susu-enterprise-tech.png"
        imageAlt="Enterprise susu technology for microfinance operators"
        mock={<PlatformHeroMock />}
        secondaryCta={{ label: "See how it works", href: "/how-it-works" }}
      />

      <ProductFeatureSplit
        background="paper"
        eyebrow="Reconciliation"
        title="Automated Reconciliation"
        paragraphs={[
          "Reconciling daily Susu deposits used to take hours of manual data entry and cross referencing. SusuFlow features a real time, double entry ledger that automatically balances every cedi.",
          "Our engine directly cross references your internal ledger with the mobile money gateway's ledger. If a deposit is received, your books reflect it instantly. Never worry about balancing the books at midnight again.",
        ]}
        bullets={[
          "Real time double entry ledger",
          "Automatic gateway cross referencing",
          "Books that balance themselves",
        ]}
        link={{
          label: "See bank grade accounting",
          href: "/why-susuflow/bank-grade-accounting",
        }}
        tile={SKY}
        image="/marketing/susu-office-manager.png"
        imageAlt="A manager reviewing a live double entry ledger"
        mock={<ReconciliationMock />}
      />

      <ProductFeatureSplit
        background="cream"
        flip
        eyebrow="Integrations"
        title="Gateway Integrations"
        paragraphs={[
          "SusuFlow acts as the middleware between your business and the largest telcos in Ghana. We provide native, seamless integrations with MTN MoMo, Telecel Cash, and AT Money via secure aggregators like Hubtel.",
          "You also get integrated automated SMS gateways. The moment a client deposits funds or a collector logs a payment, an instant, un spoofable SMS receipt is fired off, providing unparalleled transparency.",
        ]}
        bullets={[
          "MTN MoMo, Telecel Cash & AT Money",
          "Secure aggregators like Hubtel",
          "Instant, un spoofable SMS receipts",
        ]}
        link={{
          label: "Explore gateway verification",
          href: "/why-susuflow/gateway-verification",
        }}
        tile={SKY}
        image="/marketing/susu-trader-payment.png"
        imageAlt="A member confirming a Mobile Money payment"
        mock={<IntegrationsMock />}
      />

      <ProductFeatureSplit
        background="paper"
        eyebrow="Reporting"
        title="Live Ledger & Reports"
        paragraphs={[
          "Make data driven decisions with access to real time financial reporting. Track your entire company's liquidity, outstanding loans, and daily deposit velocity from a single dashboard.",
          "Instantly export trial balances, comprehensive audit logs, and management balance sheets in PDF or CSV formats. Hand your auditors a pristine, mathematically perfect record of your business.",
        ]}
        bullets={[
          "Live liquidity and deposit velocity",
          "Trial balances, audit logs & balance sheets",
          "One click PDF and CSV exports",
        ]}
        link={{
          label: "Built for accountants & management",
          href: "/why-susuflow/accountants-and-management",
        }}
        tile={SKY}
        image="/marketing/susu-office-manager.png"
        imageAlt="Exporting audit ready susu reports"
        mock={<ReportsMock />}
      />

      <ProductStatsBand
        background="cream"
        title="Books that balance themselves."
        lead="Every cedi is double entered, gateway matched and export ready. So audits become a download, not a crisis."
        stats={[
          { value: "1:1", label: "Ledger to gateway match on every deposit" },
          { value: "2", label: "Entries per transaction, always in balance" },
          { value: "Live", label: "Liquidity, loans and deposit velocity" },
          { value: "100%", label: "Auditor ready, exportable records" },
        ]}
      />

      <ProductCrossLinks
        background="paper"
        links={[
          {
            title: "Accounts & Payments",
            description:
              "Digital susu accounts, instant MoMo payouts and a cash free app for field collectors.",
            href: "/product/accounts-and-payments",
            tile: "var(--ofx-sand)",
            icon: Wallet,
          },
          {
            title: "Manage & Control",
            description:
              "Branch oversight, approval workflows and flexible savings plans. Run every branch from one hub.",
            href: "/product/manage-and-control",
            tile: "var(--ofx-sage)",
            icon: ShieldCheck,
          },
        ]}
      />
    </>
  );
}
