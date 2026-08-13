import type { Metadata } from "next";
import { HowItWorksFaqSection } from "@/components/marketing/how-it-works/how-it-works-faq-section";
import { HowItWorksHero } from "@/components/marketing/how-it-works/how-it-works-hero";
import { HowItWorksStepsSection } from "@/components/marketing/how-it-works/how-it-works-steps-section";
import { VisionQuoteSection } from "@/components/marketing/vision-quote-section";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `How it works | ${APP_NAME}`,
  description:
    "How Ghanaian susu companies move from cash and notebooks to verified MoMo deposits on SusuFlow.",
};

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorksHero />
      <VisionQuoteSection
        label="The new path"
        quote="Keep your collectors and community trust. Move the money onto a verified digital ledger. So every cedi is confirmed before anyone argues about it."
      />
      <HowItWorksStepsSection />
      <HowItWorksFaqSection />
    </>
  );
}
