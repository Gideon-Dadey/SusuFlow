import type { Metadata } from "next";
import { AboutComplianceSection } from "@/components/marketing/about/about-compliance-section";
import { AboutDetailsSection } from "@/components/marketing/about/about-details-section";
import { AboutHero } from "@/components/marketing/about/about-hero";
import { AboutPeopleSection } from "@/components/marketing/about/about-people-section";
import { AboutValuesSection } from "@/components/marketing/about/about-values-section";
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
      <AboutValuesSection />
      <AboutComplianceSection />
      <AboutPeopleSection />
      <AboutDetailsSection />
    </>
  );
}
