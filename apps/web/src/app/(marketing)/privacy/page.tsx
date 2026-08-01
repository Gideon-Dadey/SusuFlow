import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { MarketingContainer } from "@/components/marketing/marketing-container";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description: "How SusuFlow collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        description="Last updated: June 2026"
        align="left"
      />
      <section className="marketing-section">
        <MarketingContainer>
          <article className="legal-prose">
            <h2>1. Overview</h2>
            <p>
              SusuFlow (&quot;we&quot;) respects your privacy. This policy
              explains what data we collect when you use our website and
              application, and how we use it.
            </p>

            <h2>2. Data we collect</h2>
            <ul>
              <li>
                Account information: name, email, phone, tenant affiliation
              </li>
              <li>Transaction data: deposit amounts, references, timestamps</li>
              <li>
                Technical data: IP address, device type, logs for security
              </li>
            </ul>

            <h2>3. How we use data</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve the Platform</li>
              <li>Process and verify Mobile Money deposits</li>
              <li>Support customers and susu companies</li>
              <li>Meet legal and regulatory obligations</li>
            </ul>

            <h2>4. Sharing</h2>
            <p>
              We share data with payment gateways (e.g. Hubtel) as needed to
              complete transactions. We do not sell personal data. We may
              disclose information when required by law.
            </p>

            <h2>5. Security</h2>
            <p>
              We use encryption in transit, access controls, and audit logging.
              No system is 100% secure. Report concerns to{" "}
              <a href="mailto:hello@susuflow.com" className="text-secondary">
                hello@susuflow.com
              </a>
              .
            </p>

            <h2>6. Your rights</h2>
            <p>
              You may request access, correction, or deletion of your personal
              data subject to applicable law and our retention requirements for
              financial records.
            </p>

            <h2>7. Changes</h2>
            <p>
              We may update this policy. Material changes will be posted on this
              page with an updated date.
            </p>
          </article>
        </MarketingContainer>
      </section>
    </>
  );
}
