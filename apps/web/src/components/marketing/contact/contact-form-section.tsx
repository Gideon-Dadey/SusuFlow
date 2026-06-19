import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { ContactForm } from '@/components/marketing/contact-form';
import { SUPPORT_EMAIL } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function ContactFormSection() {
  return (
    <section id="contact-form" className="scroll-mt-24 border-b border-border bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Need help creating your account?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              You can call or email us anytime. Our team helps susu companies onboard collectors and
              run their first verified MoMo collection cycle.
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
  );
}
