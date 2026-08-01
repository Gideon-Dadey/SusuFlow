import type { Metadata } from "next";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { MarketingHero } from "@/components/marketing/hero";
import { MomoPayCapabilitiesSection } from "@/components/marketing/momo-pay-capabilities-section";
import { MomoPaySection } from "@/components/marketing/momo-pay-section";
import { PlatformOverviewSection } from "@/components/marketing/platform-overview-section";
import { WorkflowAutomationSection } from "@/components/marketing/workflow-automation-section";
import { SusuManagementSection } from "@/components/marketing/susu-management-section";
import { SolutionsInActionSection } from "@/components/marketing/solutions-in-action-section";
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
      <SusuManagementSection />
      <MomoPaySection />
      <MomoPayCapabilitiesSection />
      <SolutionsInActionSection />
      <WorkflowAutomationSection />
      <ApprovalWorkflowsCtaSection />
      <FaqSection />
    </>
  );
}
