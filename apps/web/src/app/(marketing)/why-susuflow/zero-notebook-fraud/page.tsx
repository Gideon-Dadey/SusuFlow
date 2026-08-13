import type { Metadata } from "next";
import {
  BookLock,
  Handshake,
  MessageSquareText,
} from "@/components/icons/phosphor";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Zero Notebook Fraud | ${APP_NAME}`,
  description:
    "How partner MFIs eliminated ledger disputes & missing cash in 30 days.",
};

export default function ZeroNotebookFraudPage() {
  return (
    <WhyPageTemplate
      accent="sage"
      hero={{
        title: "Zero notebook fraud. In 30 days.",
        lead: "Partner MFIs eliminated ledger disputes and missing cash in a single month. Digital receipts and instant SMS confirmations give savers and companies one shared truth. Making fraud structurally impossible.",
        tile: {
          label: "Ledger disputes · This month",
          value: "0 open",
          caption: "100% reduction within 30 days of deployment",
          badge: "Tamper-proof",
          rows: [
            { label: "Abena Osei", value: "GHS 50.00", status: "SMS sent" },
            { label: "Kwame Mensah", value: "GHS 120.00", status: "SMS sent" },
            { label: "Efua Boateng", value: "GHS 200.00", status: "SMS sent" },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "How it works",
        title: "Fraud can't survive a shared truth",
      }}
      highlights={[
        {
          icon: BookLock,
          title: "Immutable digital ledgers",
          body: "Paper can be lost, damaged or quietly altered. Once a transaction is verified, it's permanently etched into a secure cloud ledger. No post collection edits, ever.",
        },
        {
          icon: MessageSquareText,
          title: "Instant SMS truth",
          body: "The moment a deposit clears, the saver gets an automated SMS receipt. If a collector logs less than they took, the saver knows right at the stall.",
        },
        {
          icon: Handshake,
          title: "Zero ledger disputes",
          body: "End of month arguments over who paid what simply stop. The digital trail is absolute, protecting your reputation and the community's trust.",
        },
      ]}
      sections={[
        {
          eyebrow: "The problem",
          title: "The true cost of paper",
          paragraphs: [
            "The notebook has been the symbol of the susu collector for generations. But ink fades, pages tear, and numbers can be subtly altered after a collector leaves the market.",
            "When a saver insists they handed over 50 cedis and the notebook only shows 20, the resulting dispute destroys the one thing a microfinance institution relies on most: community trust.",
          ],
          tile: {
            heading: "End of month reconciliation",
            rows: [
              {
                label: "Notebook entry",
                value: "GHS 20.00",
                status: "Disputed",
                statusTone: "bad",
              },
              {
                label: "Saver's claim",
                value: "GHS 50.00",
                status: "Unproven",
                statusTone: "muted",
              },
              {
                label: "SusuFlow ledger",
                value: "GHS 50.00",
                status: "Verified",
              },
            ],
            footer: "One record. No arguments.",
          },
        },
        {
          eyebrow: "The fix",
          title: "An unbreakable chain of truth",
          paragraphs: [
            "SusuFlow doesn't just look for bad actors. It builds an architecture where fraud is structurally impossible to commit.",
            "Dual verification means the collector logs the payment while the saver instantly receives a digital receipt on their own device. Both sides share the exact same record, from the very first second.",
          ],
          tile: {
            heading: "Dual verification · Live",
            rows: [
              {
                label: "Collector logs deposit",
                value: "09:41",
                status: "Logged",
              },
              {
                label: "Gateway confirms funds",
                value: "09:41",
                status: "Verified",
              },
              {
                label: "SMS receipt to saver",
                value: "09:41",
                status: "Delivered",
              },
            ],
          },
        },
      ]}
      quote={{
        variant: "dark",
        text: "When the truth is instantaneous and transparent, trust flourishes. And operations scale seamlessly.",
      }}
      related={[
        {
          title: "100% gateway verification",
          description:
            "Every deposit hits the bank before it touches a client balance.",
          href: "/why-susuflow/gateway-verification",
        },
        {
          title: "Role based approvals",
          description:
            "Manager sign off on withdrawals stops internal fraud cold.",
          href: "/why-susuflow/role-based-approvals",
        },
        {
          title: "Susu companies & MFIs",
          description:
            "Purpose built software for Ghanaian operators to scale safely.",
          href: "/why-susuflow/susu-companies-and-mfis",
        },
      ]}
    />
  );
}
