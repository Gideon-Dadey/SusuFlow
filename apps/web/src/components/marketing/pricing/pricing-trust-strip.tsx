import { PRICING_TRUST_LINE } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingTrustStrip() {
  return (
    <section className="afrusan-warm-section">
      <MarketingContainer className="py-10 sm:py-12">
        <p className="mx-auto max-w-3xl text-center font-geist text-lg font-medium leading-snug text-foreground sm:text-xl">
          {PRICING_TRUST_LINE}
        </p>
      </MarketingContainer>
    </section>
  );
}
