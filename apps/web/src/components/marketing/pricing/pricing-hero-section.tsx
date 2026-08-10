import { MarketingContainer } from "../marketing-container";

export function PricingHeroSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="pb-4 pt-14 sm:pt-16 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">Pricing</p>
          <h1 className="ofx-display mt-4 text-balance">
            Simple plans. Serious savings.
          </h1>
          <p className="ofx-lead mx-auto mt-6 max-w-2xl text-balance">
            Pay for the platform, not for every deposit. Start free, scale with
            verified MoMo collections, and grow into multi-branch operations.
          </p>
        </div>
      </MarketingContainer>
    </section>
  );
}
