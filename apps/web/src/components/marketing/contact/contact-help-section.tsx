import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MarketingContainer } from '../marketing-container';

export function ContactHelpSection() {
  return (
    <section className="border-b border-border bg-background">
      <MarketingContainer className="py-12 sm:py-14">
        <div className="rounded-lg border border-border/80 bg-white p-6 text-left dark:border-border dark:bg-card sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <h2 className="text-balance text-xl font-bold text-foreground sm:text-2xl">
              Need help onboarding your susu company?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              You can email us anytime. Our team helps susu operators set up tenants, onboard
              collectors, and run their first verified MoMo collection cycle.
            </p>
          </div>
          <Link
            href="#contact-form"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary transition-colors hover:text-secondary/80 lg:mt-0 lg:shrink-0"
          >
            Contact us
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </MarketingContainer>
    </section>
  );
}
