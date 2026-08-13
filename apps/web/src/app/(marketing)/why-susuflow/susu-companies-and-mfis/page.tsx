import type { Metadata } from "next";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
} from "@/components/icons/phosphor";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Susu Companies & MFIs | ${APP_NAME}`,
  description:
    "Purpose built software for Ghanaian microfinance operators to scale safely.",
};

export default function SusuCompaniesPage() {
  return (
    <WhyPageTemplate
      accent="sky"
      hero={{
        title: "Built for susu companies and MFIs. Nothing else.",
        lead: "Purpose built software for Ghanaian microfinance operators to scale safely. Manual bookkeeping goes out; a secure, automated platform takes its place.",
        tile: {
          label: "All branches · Live",
          value: "GHS 402,118.50",
          caption: "1,860 active savers across 3 regions",
          badge: "Unified",
          rows: [
            { label: "Kumasi Central", value: "GHS 8,940.00", status: "Live" },
            { label: "Accra Makola", value: "GHS 12,300.00", status: "Live" },
            { label: "Takoradi Market", value: "GHS 5,120.00", status: "Live" },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "Why operators switch",
        title: "One platform. Every branch. Every cedi.",
      }}
      highlights={[
        {
          icon: Building2,
          title: "Centralize multi branch operations",
          body: "No more endless phone calls and disjointed spreadsheets. Monitor live collections, track agent performance across regions, and spot liquidity trends from any device, anywhere.",
        },
        {
          icon: ShieldCheck,
          title: "Eliminate operational risk",
          body: "Paper notebooks give way to a secure double entry digital ledger. Client balances only update once telco gateways confirm the cash is definitively in your corporate accounts.",
        },
        {
          icon: TrendingUp,
          title: "Scale without overhead",
          body: "Adding 50 collectors used to mean hiring more clerks. Our reconciliation engine handles 10 transactions or 10,000 with the same flawless accuracy. Add agents, not admin.",
        },
      ]}
      sections={[
        {
          eyebrow: "Made for this market",
          title: "The foundation of modern microfinance",
          paragraphs: [
            "For decades, Ghanaian microfinance ran on physical ledgers, trust based relationships and manual reconciliation. Those methods built community banking. But they can't scale safely in a digital first economy.",
            "Generic accounting software can't handle daily collection cycles, rapid micro loan disbursements, or field heavy operations. SusuFlow was engineered from the ground up specifically for susu operators and MFIs.",
          ],
          tile: {
            heading: "Operations snapshot",
            rows: [
              {
                label: "MoMo deposits today",
                value: "142 verified",
                status: "Synced",
              },
              {
                label: "Pending payouts",
                value: "GHS 12,300.00",
                status: "4 awaiting",
              },
              {
                label: "Agent performance",
                value: "38 collectors",
                status: "On target",
              },
            ],
          },
        },
        {
          eyebrow: "End to end",
          title: "From the trader's hand to your bank account",
          paragraphs: [
            "SusuFlow digitizes the entire lifecycle. From the moment a cedi leaves a trader's hand to the moment it settles in your corporate account.",
            "The result: microfinance operators transformed into robust, institutional grade financial powerhouses, capable of unlimited, risk free growth.",
          ],
          tile: {
            heading: "Deposit lifecycle",
            rows: [
              { label: "Trader confirms MoMo prompt", status: "Confirmed" },
              { label: "Gateway locks the funds", status: "Verified" },
              { label: "Ledger updates instantly", status: "Balanced" },
              { label: "Settles to corporate account", status: "Secured" },
            ],
          },
        },
      ]}
      quote={{
        text: "Generic accounting software was never built for daily collection cycles. SusuFlow was built for nothing else.",
      }}
      related={[
        {
          title: "Zero notebook fraud",
          description:
            "How partner MFIs eliminated ledger disputes in 30 days.",
          href: "/why-susuflow/zero-notebook-fraud",
        },
        {
          title: "Bank grade accounting",
          description:
            "Complete transparency for auditors, partners and regulators.",
          href: "/why-susuflow/bank-grade-accounting",
        },
        {
          title: "Market scale story",
          description:
            "Scaling from 5 to 50+ collectors across Kumasi and Accra.",
          href: "/why-susuflow/market-scale-story",
        },
      ]}
    />
  );
}
