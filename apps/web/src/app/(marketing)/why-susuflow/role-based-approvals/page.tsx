import type { Metadata } from "next";
import { FileSearch, Layers, Lock } from "@/components/icons/phosphor";
import { WhyPageTemplate } from "@/components/marketing/ofx/why-page-template";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Role-Based Approvals | ${APP_NAME}`,
  description:
    "Enforce manager sign-off on withdrawals and plan modifications.",
};

export default function RoleBasedApprovalsPage() {
  return (
    <WhyPageTemplate
      accent="sand"
      hero={{
        title: "Nothing sensitive moves without a manager's sign-off.",
        lead: "Enforce manager approval on withdrawals and plan modifications. Keep strict internal controls over your capital, and make sure only authorized personnel touch sensitive operations — stopping internal fraud before it starts.",
        tile: {
          label: "Approvals queue",
          value: "4 pending",
          caption: "Sensitive actions awaiting senior review",
          badge: "Protected",
          rows: [
            {
              label: "Withdrawal · GHS 2,500.00",
              value: "Requested by J. Owusu",
              status: "Awaiting manager",
              statusTone: "muted",
            },
            {
              label: "Plan modification",
              value: "Requested by K. Asante",
              status: "Approved",
            },
            {
              label: "Rate adjustment",
              value: "Requested by A. Mensah",
              status: "Awaiting manager",
              statusTone: "muted",
            },
          ],
        },
      }}
      highlightsHeading={{
        eyebrow: "Internal controls",
        title: "Delegate authority. Never lose control.",
      }}
      highlights={[
        {
          icon: Layers,
          title: "Multi-tier authorization",
          body: "Significant actions — large withdrawals, interest rate adjustments — can't be executed by one person. A junior officer initiates; the request waits until a senior manager digitally signs off.",
        },
        {
          icon: Lock,
          title: "Granular access control",
          body: "A field collector sees only their assigned clients. A branch manager sees only their region. Only the executive dashboard holds the master keys.",
        },
        {
          icon: FileSearch,
          title: "Total accountability",
          body: "Every modification logs who requested it, who approved it, and when. If something goes wrong, trace it to the exact user accounts involved — in seconds.",
        },
      ]}
      sections={[
        {
          eyebrow: "The principle",
          title: "Trust your team, but verify everything",
          paragraphs: [
            "As an MFI grows, the founder can no longer oversee every transaction. You have to delegate to branch managers, loan officers and clerks — and without software controls, that delegation opens the door to internal fraud and reckless data modifications.",
            "SusuFlow's role-based access control engine enforces your operational hierarchy at the code level. The principle of least privilege applies automatically: staff get access to exactly what their job requires, and nothing more.",
          ],
          tile: {
            heading: "Withdrawal · GHS 2,500.00",
            rows: [
              {
                label: "Initiated by loan officer",
                value: "14:02",
                status: "Logged",
              },
              {
                label: "Held for senior review",
                value: "14:02",
                status: "Pending",
                statusTone: "muted",
              },
              {
                label: "Manager signs off",
                value: "14:38",
                status: "Approved",
              },
              {
                label: "Full trail recorded",
                value: "User, time, IP",
                status: "Permanent",
              },
            ],
          },
        },
      ]}
      quote={{
        variant: "dark",
        text: "Mandatory sign-offs remove the temptation for bad actors — and protect honest employees with rigorous, undeniable logs.",
      }}
      related={[
        {
          title: "Zero notebook fraud",
          description:
            "Digital receipts make external fraud structurally impossible too.",
          href: "/why-susuflow/zero-notebook-fraud",
        },
        {
          title: "Accountants & management",
          description:
            "Reconcile books in seconds with double-entry ledgers and audit trails.",
          href: "/why-susuflow/accountants-and-management",
        },
        {
          title: "Bank-grade accounting",
          description:
            "The transparency auditors, partners and regulators demand.",
          href: "/why-susuflow/bank-grade-accounting",
        },
      ]}
    />
  );
}
