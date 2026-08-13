import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/marketing/legal-doc-layout";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description: "Terms governing use of the SusuFlow platform.",
};

export default function TermsPage() {
  return (
    <LegalDocLayout
      title="Terms of Service"
      updated="Last updated: June 2026"
      related={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/contact", label: "Contact" },
      ]}
      sections={[
        {
          id: "acceptance",
          title: "1. Acceptance",
          content: (
            <p>
              By accessing or using SusuFlow (&quot;the Platform&quot;), you
              agree to these Terms of Service. If you do not agree, do not use
              the Platform.
            </p>
          ),
        },
        {
          id: "services",
          title: "2. Services",
          content: (
            <p>
              SusuFlow provides software for digital susu savings management,
              including customer wallets, collector tools, staff dashboards, and
              payment gateway integrations. We do not hold customer funds.
              Deposits are processed through licensed payment providers.
            </p>
          ),
        },
        {
          id: "accounts",
          title: "3. Accounts",
          content: (
            <p>
              You are responsible for maintaining the confidentiality of your
              credentials and for all activity under your account. Susu
              companies are responsible for staff and collector access they
              grant within their tenant.
            </p>
          ),
        },
        {
          id: "acceptable-use",
          title: "4. Acceptable use",
          content: (
            <>
              <p>You may not use the Platform to:</p>
              <ul className="list disc space-y-2 pl-5">
                <li>Commit fraud, money laundering, or illegal activity</li>
                <li>
                  Attempt to bypass payment verification or ledger controls
                </li>
                <li>Interfere with Platform security or availability</li>
              </ul>
            </>
          ),
        },
        {
          id: "fees",
          title: "5. Fees",
          content: (
            <p>
              Subscription fees for susu companies are described on our Pricing
              page. Payment gateway fees may apply separately per your provider
              agreement.
            </p>
          ),
        },
        {
          id: "liability",
          title: "6. Limitation of liability",
          content: (
            <p>
              {" "}
              The Platform is provided &quot;as is.&quot; To the extent
              permitted by law, SusuFlow is not liable for indirect damages
              arising from use of the service or third party payment
              failures.{" "}
            </p>
          ),
        },
        {
          id: "contact",
          title: "7. Contact",
          content: (
            <p>
              Questions about these terms:{" "}
              <a
                href="mailto:hello@susuflow.com"
                className="font-medium text-[#1a1a1a] underline-offset-4 hover:underline dark:text-white"
              >
                hello@susuflow.com
              </a>
            </p>
          ),
        },
      ]}
    />
  );
}
