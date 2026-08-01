import type { Metadata } from "next";
import { AboutComplianceSection } from "@/components/marketing/about/about-compliance-section";
import { AboutCtaSection } from "@/components/marketing/about/about-cta-section";
import { AboutDetailsSection } from "@/components/marketing/about/about-details-section";
import { AboutHero } from "@/components/marketing/about/about-hero";
import { AboutPeopleSection } from "@/components/marketing/about/about-people-section";
import { AboutPlatformLinksSection } from "@/components/marketing/about/about-platform-links-section";
import { AboutPlatformSection } from "@/components/marketing/about/about-platform-section";
import { AboutStorySection } from "@/components/marketing/about/about-story-section";
import { AboutTeamSection } from "@/components/marketing/about/about-team-section";
import { AboutTrustStrip } from "@/components/marketing/about/about-trust-strip";
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
      <AboutTeamSection />
      <AboutPeopleSection />
      <AboutTrustStrip />
      <AboutPlatformLinksSection />
      <AboutPlatformSection />
      <AboutStorySection />
      <AboutComplianceSection />
      <AboutDetailsSection />
      <AboutCtaSection />
    </>
  );
}
