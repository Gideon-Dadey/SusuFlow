import type { Metadata } from "next";
import { HowItWorksFaqSection } from "@/components/marketing/how-it-works/how-it-works-faq-section";
import { HowItWorksHero } from "@/components/marketing/how-it-works/how-it-works-hero";
import { HowItWorksStepsSection } from "@/components/marketing/how-it-works/how-it-works-steps-section";
import { HowItWorksTraditionalSection } from "@/components/marketing/how-it-works/how-it-works-traditional-section";
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
      <HowItWorksTraditionalSection />
      <HowItWorksStepsSection />
      <HowItWorksFaqSection />
    </>
  );
}
