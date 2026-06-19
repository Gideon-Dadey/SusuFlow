import { PRICING_TRUST_LINE } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function PricingTrustStrip() {
  return (
    <section className="border-b border-border/60 bg-background">
      <MarketingContainer className="py-10 sm:py-12">
        <p className="text-center text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {PRICING_TRUST_LINE}
        </p>
      </MarketingContainer>
    </section>
  );
}
