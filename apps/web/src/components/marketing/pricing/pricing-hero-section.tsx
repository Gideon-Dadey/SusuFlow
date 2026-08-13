import { PRICING_HERO_IMAGE } from "@/lib/brand-assets";
import { SplitPreview } from "../split-preview";

export function PricingHeroSection() {
  return (
    <SplitPreview
      eyebrow="Pricing"
      title="Simple plans. Serious savings."
      lead="Pay for the platform, not for every deposit. Start free, scale with verified MoMo collections, and grow into multi branch operations."
      image={PRICING_HERO_IMAGE}
      imageAlt="A susu company manager reviewing digital collections in the office"
    />
  );
}
