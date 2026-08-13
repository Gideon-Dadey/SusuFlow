import type { Metadata } from "next";
import { FileCheck, Landmark, Scale } from "@/components/icons/phosphor";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Bank Grade Accounting | ${APP_NAME}`,
  description: "Complete transparency for auditors, partners, and regulators.",
};

export default function BankGradeAccountingPage() {
  return (
    <WhyPageTemplate
      accent="lilac"
      hero={{
        title: "Books so clean, auditors get bored.",
        lead: "Complete transparency for auditors, partners and regulators. A double entry accounting engine logs every action, timestamp and user. Generating automated balance sheets to bank grade reporting standards.",
        tile: {
          label: "Trial balance · Live",
          value: "GHS 402,118.50",
          caption: "Debits and credits, perfectly matched",
          badge: "Balanced",
          rows: [
            {
              label: "Total debits",
              value: "GHS 402,118.50",
              status: "Matched",
            },
            {
              label: "Total credits",
              value: "GHS 402,118.50",
              status: "Matched",
            },
            { label: "Unbalanced entries", value: "0", status: "Impossible" },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "Institutional standards",
        title: "Reporting that opens doors",
      }}
      highlights={[
        {
          icon: Landmark,
          title: "Attract institutional partners",
          body: "Commercial banks and international NGOs demand rigorous transparency before they invest. SusuFlow generates the standardized reporting, trial balances and audit trails they require.",
        },
        {
          icon: FileCheck,
          title: "Effortless regulatory compliance",
          body: "Built around core financial compliance standards. Generate Bank of Ghana mandated reports in one click instead of weeks of spreadsheet wrangling. Never miss a filing or fail a spot audit.",
        },
        {
          icon: Scale,
          title: "Automated balance sheets",
          body: "Every deposit, withdrawal, penalty and interest payment is captured in strict double entry format, so your balance sheets construct themselves. Accountants analyze; they don't type.",
        },
      ]}
      sections={[
        {
          eyebrow: "The growth unlock",
          title: "Bridging the gap to institutional finance",
          paragraphs: [
            "Many microfinance operations hit a growth plateau not because they lack clients, but because they lack the pristine reporting required to secure institutional credit. Investors can't deploy capital into fragmented spreadsheets and manual ledgers.",
            "SusuFlow bakes the double entry standards of top tier commercial banks directly into the daily workflow of a susu collector. One sided entries are impossible by design.",
            "The result is a permanent state of audit readiness: flawless balance sheets, traceable asset flows and comprehensive income statements that elevate your operation from local cooperative to institutional grade financial entity.",
          ],
          tile: {
            heading: "Audit pack · One click",
            rows: [
              { label: "Trial balance", value: "PDF · CSV", status: "Ready" },
              {
                label: "Income statement",
                value: "PDF · CSV",
                status: "Ready",
              },
              {
                label: "Full audit trail",
                value: "User, time, IP",
                status: "Ready",
              },
              {
                label: "Preparation time",
                value: "Minutes, not weeks",
                status: "Done",
              },
            ],
          },
        },
      ]}
      quote={{
        text: "A permanent state of audit readiness. Flawless balance sheets, traceable flows, institutional grade books.",
      }}
      related={[
        {
          title: "Accountants & management",
          description:
            "Reconcile books in seconds with double entry ledgers and audit trails.",
          href: "/why-susuflow/accountants-and-management",
        },
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
      ]}
    />
  );
}
