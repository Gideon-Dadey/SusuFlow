import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingContainer } from '@/components/marketing/marketing-container';
import { CtaSection } from '@/components/marketing/cta-section';
import { APP_NAME, PRICING_PLANS } from '@/lib/marketing-data';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: `Pricing — ${APP_NAME}`,
  description: 'Simple pricing for susu companies of every size — from trial to enterprise.',
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        title="Pricing that scales with your susu"
        description="Start free, grow with confidence. No hidden fees on deposits — you pay for the platform, not per transaction."
      />
      <section className="marketing-section">
        <MarketingContainer>
          <div className="grid gap-8 lg:grid-cols-3 xl:gap-10 2xl:gap-12">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  'flex flex-col rounded-lg border p-8 shadow-card',
                  plan.highlighted
                    ? 'border-secondary bg-card ring-2 ring-secondary/20'
                    : 'border-border bg-card',
                )}
              >
                <h2 className="text-base font-bold tracking-tight text-foreground sm:text-lg">{plan.name}</h2>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-[1.65rem]">
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span className="text-xs text-muted-foreground sm:text-sm">{plan.period}</span>
                  ) : null}
                </div>
                <p className="mt-3 text-xs leading-snug text-muted-foreground sm:text-sm">{plan.description}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs leading-snug text-foreground sm:text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={
                    plan.name === 'Enterprise'
                      ? '/contact?intent=sales'
                      : '/contact?intent=demo'
                  }
                  className="mt-8"
                >
                  <Button
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    className="w-full rounded-lg"
                  >
                    {plan.name === 'Enterprise' ? 'Contact sales' : 'Request demo'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Need a custom quote for multiple branches?{' '}
            <Link href="/contact?intent=demo" className="font-semibold text-secondary hover:text-secondary/80">
              Talk to our team
            </Link>
          </p>
        </MarketingContainer>
      </section>
      <CtaSection />
    </>
  );
}
