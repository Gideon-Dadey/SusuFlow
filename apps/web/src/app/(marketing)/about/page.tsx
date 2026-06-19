import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageHero } from '@/components/marketing/page-hero';
import { MarketingContainer } from '@/components/marketing/marketing-container';
import { APP_NAME } from '@/lib/marketing-data';

export const metadata: Metadata = {
  title: `About | ${APP_NAME}`,
  description: 'Our mission to digitize susu savings in Ghana with trust, transparency, and Mobile Money.',
};

const VALUES = [
  {
    title: 'Trust first',
    body: 'Every cedi is gateway-confirmed. Savers see proof; companies see reconciled books.',
  },
  {
    title: 'Built for Ghana',
    body: 'MTN MoMo, local susu culture, and field collectors, not a generic Western fintech clone.',
  },
  {
    title: 'Transparency',
    body: 'Double-entry ledgers, audit trails, and role-based access so nothing hides in spreadsheets.',
  },
  {
    title: 'Inclusive growth',
    body: 'Digital tools that strengthen susu relationships instead of replacing them.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Digitizing susu without breaking trust"
        description="SusuFlow was built for the way savings actually work in Ghana: community-led, collector-assisted, and now verified through Mobile Money."
      />
      <section className="marketing-section">
        <MarketingContainer>
          <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              Traditional susu has helped millions of Ghanaians save for decades. But cash collection
              creates friction: lost deposits, disputed balances, and collectors blamed when money
              goes missing.
            </p>
            <p>
              SusuFlow keeps the susu model: regular contributions, group discipline, collector
              relationships, while routing every deposit through Mobile Money. Collectors onboard
              savers and help them pay; they never hold cash. Companies get real-time visibility;
              savers get receipts and peace of mind.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {VALUES.map(({ title, body }) => (
              <div key={title} className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Check className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-foreground sm:text-xl">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-lg border border-border bg-muted/50 p-8 text-center">
            <h2 className="text-xl font-bold text-foreground">Join the movement</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Whether you run a susu company or save with one, we&apos;re here to help you go
              cashless.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block text-sm font-semibold text-secondary hover:text-secondary/80"
            >
              Get in touch →
            </Link>
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}
