import type { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingContainer } from '@/components/marketing/marketing-container';
import { ContactForm } from '@/components/marketing/contact-form';
import { APP_NAME, SUPPORT_EMAIL } from '@/lib/marketing-data';

export const metadata: Metadata = {
  title: `Contact | ${APP_NAME}`,
  description: 'Get in touch with the SusuFlow team for sales, support, or partnerships.',
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="We'd love to hear from you"
        description="Questions about onboarding your susu company, partnerships, or support. Our team responds within one business day."
      />
      <section className="marketing-section">
        <MarketingContainer>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-bold text-foreground">Get in touch</h2>
              <p className="mt-3 text-muted-foreground">
                Fill out the form and we&apos;ll route your message to the right person: sales,
                support, or partnerships.
              </p>
              <ul className="mt-8 space-y-5">
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mt-1 h-5 w-5 shrink-0 text-secondary"
                  />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-sm text-muted-foreground hover:text-secondary"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={faLocationDot}
                    className="mt-1 h-5 w-5 shrink-0 text-secondary"
                  />
                  <div>
                    <p className="font-medium text-foreground">Office</p>
                    <p className="text-sm text-muted-foreground">Accra, Ghana</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FontAwesomeIcon icon={faClock} className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">Response time</p>
                    <p className="text-sm text-muted-foreground">Within 1 business day</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-8">
              <ContactForm />
            </div>
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}
