import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/marketing/legal-doc-layout";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: "How SusuFlow collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalDocLayout
      title="Privacy Policy"
      updated="Last updated: June 2026"
      related={[
        { href: "/terms", label: "Terms of Service" },
        { href: "/contact", label: "Contact" },
      ]}
      sections={[
        {
          id: "overview",
          title: "1. Overview",
          content: (
            <p>
              SusuFlow (&quot;we&quot;) respects your privacy. This policy
              explains what data we collect when you use our website and
              application, and how we use it.
            </p>
          ),
        },
        {
          id: "data",
          title: "2. Data we collect",
          content: (
            <ul className="list disc space-y-2 pl-5">
              <li>
                Account information: name, email, phone, tenant affiliation
              </li>
              <li>Transaction data: deposit amounts, references, timestamps</li>
              <li>
                Technical data: IP address, device type, logs for security
              </li>
            </ul>
          ),
        },
        {
          id: "use",
          title: "3. How we use data",
          content: (
            <>
              <p>We use your information to:</p>
              <ul className="list disc space-y-2 pl-5">
                <li>Provide and improve the Platform</li>
                <li>Process and verify Mobile Money deposits</li>
                <li>Support customers and susu companies</li>
                <li>Meet legal and regulatory obligations</li>
              </ul>
            </>
          ),
        },
        {
          id: "sharing",
          title: "4. Sharing",
          content: (
            <p>
              We share data with payment gateways (e.g. Hubtel) as needed to
              complete transactions. We do not sell personal data. We may
              disclose information when required by law.
            </p>
          ),
        },
        {
          id: "security",
          title: "5. Security",
          content: (
            <p>
              We use encryption in transit, access controls, and audit logging.
              No system is 100% secure. Report concerns to{" "}
              <a
                href="mailto:hello@susuflow.com"
                className="font-medium text-[#1a1a1a] underline-offset-4 hover:underline dark:text-white"
              >
                hello@susuflow.com
              </a>
              .
            </p>
          ),
        },
        {
          id: "rights",
          title: "6. Your rights",
          content: (
            <p>
              You may request access, correction, or deletion of your personal
              data subject to applicable law and our retention requirements for
              financial records.
            </p>
          ),
        },
        {
          id: "changes",
          title: "7. Changes",
          content: (
            <p>
              We may update this policy. Material changes will be posted on this
              page with an updated date.
            </p>
          ),
        },
      ]}
    />
  );
}
