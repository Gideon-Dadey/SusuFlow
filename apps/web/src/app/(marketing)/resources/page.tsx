import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/marketing-container";
import { MicroLabel } from "@/components/marketing/micro-label";
import { OfxResourcesExplorer } from "@/components/marketing/ofx/resources-explorer";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `${APP_NAME} | Resources`,
  description:
    "Insights, news and stories for susu operators. From cashless collections and verified MoMo deposits to approvals, ledgers and growing multi branch teams.",
};

export default function ResourcesPage() {
  return (
    <section className="omnih-atmosphere bg-white dark:bg-twitter-dark">
      <MarketingContainer className="pb-16 pt-14 sm:pt-16 lg:pb-24">
        <div className="max-w-2xl">
          <MicroLabel>Resources</MicroLabel>
          <h1 className="hero-title mt-4">Insights, news and stories</h1>
          <p className="omnih-body mt-6">
            {" "}
            Practical guides and fresh thinking for susu operators building
            cashless, dispute free operations.{" "}
          </p>
        </div>
        <div className="mt-14">
          <OfxResourcesExplorer />
        </div>
      </MarketingContainer>
    </section>
  );
}
