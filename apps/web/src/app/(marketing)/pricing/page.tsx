import type { Metadata } from "next";
import { PricingAudienceSection } from "@/components/marketing/pricing/pricing-audience-section";
import { PricingComparisonSection } from "@/components/marketing/pricing/pricing-comparison-section";
import { PricingFaqSection } from "@/components/marketing/pricing/pricing-faq-section";
import { PricingHeroSection } from "@/components/marketing/pricing/pricing-hero-section";
import { PricingPlansSection } from "@/components/marketing/pricing/pricing-plans-section";
import { PricingRoiSection } from "@/components/marketing/pricing/pricing-roi-section";
import { PricingTrustStrip } from "@/components/marketing/pricing/pricing-trust-strip";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Pricing | ${APP_NAME}`,
  description:
    "Simple pricing for Ghanaian susu companies. Free trial, Growth at GHS 299 per month, and Enterprise plans. No per deposit fees.",
};

export default function PricingPage() {
  return (
    <>
      <PricingHeroSection />
      <PricingPlansSection />
      <PricingTrustStrip />
      <PricingComparisonSection />
      <PricingAudienceSection />
      <PricingRoiSection />
      <PricingFaqSection />
    </>
  );
}
