import { BadgeCheck } from "@/components/icons/phosphor";
import { PRICING_TRUST_LINE } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingTrustStrip() {
  return (
    <section className="bg-[var(--ofx-cream-deep)]">
      <MarketingContainer className="py-10 sm:py-12">
        <p className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2.5 text-center text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
          <BadgeCheck
            className="h-5 w-5 shrink-0 text-[var(--ofx-flame)]"
            aria-hidden
          />
          {PRICING_TRUST_LINE}
        </p>
      </MarketingContainer>
    </section>
  );
}
