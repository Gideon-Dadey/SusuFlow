import type { Metadata } from "next";
import { CapabilitiesTabsSection } from "@/components/marketing/capabilities-tabs-section";
import { MarketingHero } from "@/components/marketing/hero";
import { MomoPaySection } from "@/components/marketing/momo-pay-section";
import { PlatformOverviewSection } from "@/components/marketing/platform-overview-section";
import { SolutionsInActionSection } from "@/components/marketing/solutions-in-action-section";
import { TeamPreviewSection } from "@/components/marketing/team-preview-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { WorkflowAutomationSection } from "@/components/marketing/workflow-automation-section";
import { APP_NAME, APP_TAGLINE } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `${APP_NAME} | Digital Susu Savings for Ghana`,
  description: APP_TAGLINE,
};

export default function HomePage() {
  return (
    <>
      <MarketingHero />
      <PlatformOverviewSection />
      <MomoPaySection />
      <CapabilitiesTabsSection />
      <div className="[&>section+section]:mt-0">
        <TeamPreviewSection />
        <TestimonialsSection />
      </div>
      <SolutionsInActionSection />
      <WorkflowAutomationSection />
    </>
  );
}
