import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Banknote, Receipt, UserPlus, Wallet } from 'lucide-react';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingContainer } from '@/components/marketing/marketing-container';
import { CtaSection } from '@/components/marketing/cta-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { APP_NAME } from '@/lib/marketing-data';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: `How it works — ${APP_NAME}`,
  description: 'From registration to verified MoMo deposits — how digital susu works on SusuFlow.',
};

const DETAILED_STEPS = [
  {
    icon: UserPlus,
    title: 'Register under your susu company',
    body: 'Create an account with your company tenant slug (e.g. abc-susu). Collectors can onboard you in the field if you prefer.',
  },
  {
    icon: Wallet,
    title: 'Fund via Mobile Money',
    body: 'Initiate a deposit from your dashboard or with collector assistance. Pay through MTN MoMo — funds credit only after gateway confirmation.',
  },
  {
    icon: Receipt,
    title: 'Receive instant proof',
    body: 'Every successful deposit generates a reference, receipt, and ledger entry. Your balance updates in real time.',
  },
  {
    icon: Banknote,
    title: 'Withdraw on schedule',
    body: 'When it is your turn or per your group rules, request a withdrawal. Staff approve with full audit trail.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        title="Cashless susu, step by step"
        description="No more “the collector took it.” Every contribution is verified by the payment gateway before it hits your wallet."
        align="left"
      />
      <section className="marketing-section bg-background">
        <MarketingContainer>
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            {DETAILED_STEPS.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="premium-card flex flex-col gap-5 p-6 sm:p-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground sm:text-lg">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-secondary/20 bg-secondary/5 p-8 sm:mt-16 sm:p-10">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">For susu companies</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Admins configure tenants, invite staff and collectors, set commission rules, and
              monitor deposits from a single dashboard. Auditors get read-only access with
              exportable reports.
            </p>
            <Link href="/pricing" className="mt-8 inline-block">
              <Button size="lg" className="text-base">
                View pricing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </MarketingContainer>
      </section>
      <FaqSection />
      <CtaSection />
    </>
  );
}
