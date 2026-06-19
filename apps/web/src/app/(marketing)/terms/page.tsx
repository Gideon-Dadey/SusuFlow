import type { Metadata } from 'next';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingContainer } from '@/components/marketing/marketing-container';
import { APP_NAME } from '@/lib/marketing-data';

export const metadata: Metadata = {
  title: `Terms of Service | ${APP_NAME}`,
  description: 'Terms governing use of the SusuFlow platform.',
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        title="Terms of Service"
        description="Last updated: June 2026"
        align="left"
      />
      <section className="marketing-section">
        <MarketingContainer>
          <article className="legal-prose">
            <h2>1. Acceptance</h2>
            <p>
              By accessing or using SusuFlow (&quot;the Platform&quot;), you agree to these Terms of
              Service. If you do not agree, do not use the Platform.
            </p>

            <h2>2. Services</h2>
            <p>
              SusuFlow provides software for digital susu savings management, including customer
              wallets, collector tools, staff dashboards, and payment gateway integrations. We do
              not hold customer funds. Deposits are processed through licensed payment providers.
            </p>

            <h2>3. Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your credentials and for all
              activity under your account. Susu companies are responsible for staff and collector
              access they grant within their tenant.
            </p>

            <h2>4. Acceptable use</h2>
            <p>You may not use the Platform to:</p>
            <ul>
              <li>Commit fraud, money laundering, or illegal activity</li>
              <li>Attempt to bypass payment verification or ledger controls</li>
              <li>Interfere with Platform security or availability</li>
            </ul>

            <h2>5. Fees</h2>
            <p>
              Subscription fees for susu companies are described on our Pricing page. Payment
              gateway fees may apply separately per your provider agreement.
            </p>

            <h2>6. Limitation of liability</h2>
            <p>
              The Platform is provided &quot;as is.&quot; To the extent permitted by law, SusuFlow
              is not liable for indirect damages arising from use of the service or third-party
              payment failures.
            </p>

            <h2>7. Contact</h2>
            <p>
              Questions about these terms:{' '}
              <a href="mailto:hello@susuflow.com" className="text-secondary">
                hello@susuflow.com
              </a>
            </p>
          </article>
        </MarketingContainer>
      </section>
    </>
  );
}
