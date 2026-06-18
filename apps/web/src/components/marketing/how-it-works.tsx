import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS } from '@/lib/marketing-data';
import { MarketingContainer } from './marketing-container';
import { SectionHeader } from './section-header';

export function HowItWorksSection({ showLink = true }: { showLink?: boolean }) {
  return (
    <section className="marketing-section border-t border-border bg-background">
      <MarketingContainer>
        <SectionHeader
          title="How SusuFlow works"
          description="Three simple steps from signup to verified savings — no cash, no guesswork."
        />
        <div className="marketing-section-grid lg:grid-cols-3">
          {HOW_IT_WORKS.map(({ step, title, description }) => (
            <div key={step} className="relative">
              <span className="mt-2 text-5xl font-bold text-secondary/20 sm:text-6xl">{step}</span>
              <h3 className="mt-2 text-base font-bold text-foreground sm:text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
        {showLink ? (
          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition-colors hover:text-secondary/80"
            >
              Full walkthrough
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </MarketingContainer>
    </section>
  );
}
