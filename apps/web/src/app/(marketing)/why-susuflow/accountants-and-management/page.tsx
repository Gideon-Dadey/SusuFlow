import type { Metadata } from "next";
import { BookOpenCheck, FileSearch, RefreshCw } from "lucide-react";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Accountants & Management | ${APP_NAME}`,
  description:
    "Reconcile books in seconds with double-entry ledgers & audit trails.",
};

export default function AccountantsPage() {
  return (
    <WhyPageTemplate
      accent="sage"
      hero={{
        title: "Month-end close, in seconds. Not late nights.",
        lead: "Reconcile books instantly with double-entry ledgers and audit trails. Management and accountants get pristine records, exportable trial balances and balance sheets that make financial oversight stress-free.",
        tile: {
          label: "Month-end reconciliation",
          value: "GHS 0.00",
          caption: "Unexplained variance across all gateways",
          badge: "Reconciled",
          rows: [
            {
              label: "MTN MoMo statement",
              value: "1,842 transactions",
              status: "Matched",
            },
            {
              label: "Telecel Cash statement",
              value: "486 transactions",
              status: "Matched",
            },
            {
              label: "AT Money statement",
              value: "217 transactions",
              status: "Matched",
            },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "For the back office",
        title: "From data entry to real analysis",
      }}
      highlights={[
        {
          icon: BookOpenCheck,
          title: "Automated double-entry ledger",
          body: "Every deposit, loan disbursement and penalty fee logs its corresponding debits and credits automatically. Your books are mathematically perfect at all times — no manual entry errors.",
        },
        {
          icon: RefreshCw,
          title: "Instant gateway reconciliation",
          body: "MTN MoMo, Telecel and AT deposits are cross-referenced against collector logs in real time. Discrepancies are flagged instantly, so declared liquidity matches the bank down to the last pesewa.",
        },
        {
          icon: FileSearch,
          title: "Pristine audit trails",
          body: "Every action is permanently logged with timestamp, IP address and user ID. Generate unalterable PDF and CSV reports for regulators, board members or external auditors in one click.",
        },
      ]}
      sections={[
        {
          eyebrow: "The transformation",
          title: "Ending the reconciliation nightmare",
          paragraphs: [
            "Ask any MFI accountant about month-end and you'll hear horror stories: late nights, mismatched spreadsheets, missing funds. The sheer volume of daily susu micro-transactions makes manual reconciliation an impossible, error-prone task.",
            "SusuFlow turns accountants from data-entry clerks into strategic financial analysts. The double-entry ledger is fully automated — every deposit, withdrawal and fee is instantly logged and balanced across all accounts without human intervention.",
            "Management can look at a dashboard and trust, with absolute certainty, that the numbers on screen reflect the liquidity in the bank. When audits approach, pristine trails take minutes to produce, not weeks.",
          ],
          tile: {
            heading: "Before vs. after SusuFlow",
            rows: [
              {
                label: "Month-end close",
                value: "Seconds",
                status: "Was 5+ days",
              },
              {
                label: "Manual journal entries",
                value: "0",
                status: "Automated",
              },
              {
                label: "Audit preparation",
                value: "One click",
                status: "Was weeks",
              },
            ],
          },
        },
      ]}
      quote={{
        variant: "dark",
        text: "The numbers on the screen match the liquidity in the bank — with absolute certainty, every single day.",
      }}
      related={[
        {
          title: "Bank-grade accounting",
          description:
            "The transparency auditors, partners and regulators demand.",
          href: "/why-susuflow/bank-grade-accounting",
        },
        {
          title: "Role-based approvals",
          description:
            "Manager sign-off on withdrawals stops internal fraud cold.",
          href: "/why-susuflow/role-based-approvals",
        },
        {
          title: "Susu companies & MFIs",
          description:
            "Purpose-built software for Ghanaian operators to scale safely.",
          href: "/why-susuflow/susu-companies-and-mfis",
        },
      ]}
    />
  );
}
