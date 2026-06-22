import { ABOUT_TRUST_LINE } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function AboutTrustStrip() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-10 sm:py-12">
        <p className="text-center text-lg font-semibold leading-snug text-foreground sm:text-xl">
          {ABOUT_TRUST_LINE}
        </p>
      </MarketingContainer>
    </section>
  );
}
