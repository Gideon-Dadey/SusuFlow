import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { CONTACT_OFFICE, SUPPORT_EMAIL } from '@/lib/marketing-data';
import { Button } from '@/components/ui/button';
import { MarketingContainer } from '../marketing-container';

export function ContactHero() {
  return (
    <section className="border-b border-border/60 bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <p className="text-sm font-medium text-muted-foreground">Contact us</p>
          <h1 className="marketing-hero-title mt-3 text-balance text-foreground">
            {CONTACT_OFFICE.headline}
          </h1>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-16">
          <div className="text-left">
            <h2 className="text-base font-bold text-foreground">Office address</h2>
            <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground sm:text-base">
              {CONTACT_OFFICE.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`mailto:${SUPPORT_EMAIL}`}>
                <Button variant="outline" className="h-11 w-full rounded-lg sm:w-auto">
                  <Mail className="size-4" aria-hidden />
                  Email us
                </Button>
              </Link>
              <Link href="#contact-form">
                <Button className="h-11 w-full rounded-lg shadow-[0_4px_14px_rgba(34,197,94,0.25)] sm:w-auto">
                  Request a demo
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-white p-6 dark:border-border dark:bg-card sm:p-8">
            <h2 className="text-base font-bold text-foreground">
              We are on hand to answer your questions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Whether you run a susu company, manage collectors in the field, or want to partner with
              us, our team responds within one business day.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Response time:</span>{' '}
              {CONTACT_OFFICE.responseTime}
            </p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
