import type { Metadata } from "next";
import { AboutHero } from "@/components/marketing/about/about-hero";
import { AboutValuesSection } from "@/components/marketing/about/about-values-section";
import { LeadershipSection } from "@/components/marketing/leadership-section";
import { VisionQuoteSection } from "@/components/marketing/vision-quote-section";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `About us | ${APP_NAME}`,
  description:
    "Learn about SusuFlow. We digitize susu savings in Ghana with verified MoMo deposits, transparent ledgers, and tools built for collectors and susu companies.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <VisionQuoteSection
        label="Our thesis"
        quote="Digitize susu collections without breaking the community trust that makes savings work in Ghana."
      />
      <AboutValuesSection />
      <LeadershipSection />
    </>
  );
}
