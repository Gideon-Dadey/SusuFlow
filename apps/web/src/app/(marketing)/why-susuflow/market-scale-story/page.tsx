import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import { BRAND_WORKFLOW_AUTOMATION } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Market Scale Story | ${APP_NAME}`,
  description:
    "Scaling from 5 to 50+ collectors across Kumasi & Accra markets.",
};

export default function MarketScaleStoryPage() {
  const features = [
    {
      id: "rapid-deployment",
      title: "Deploy Agents in Minutes",
      description: (
        <>
          <p>
            When a leading cooperative expanded from Kumasi to Accra, they
            needed to deploy dozens of new collectors overnight. With legacy
            systems, this meant days of training and printing physical logs.
          </p>
          <p>
            Using SusuFlow, they simply created new profiles in the Control Hub.
            The new agents downloaded the app, logged in, and were instantly
            ready to process verified deposits on day one.
          </p>
        </>
      ),
      imageSrc: "/marketing/product/susu-field-collector.png",
      imageAlt: "New field agent deployed using the app",
      isMockup: false,
    },
    {
      id: "branch-control",
      title: "Retain Centralized Control",
      description: (
        <>
          <p>
            Scaling often means losing oversight. But by utilizing our
            Multi-Branch Management architecture, the head office retained
            absolute, real-time visibility into every new sector.
          </p>
          <p>
            They set distinct collection targets for Kumasi vs. Accra, segmented
            their reporting, and monitored the exact performance of every new
            hire without ever leaving headquarters.
          </p>
        </>
      ),
      imageSrc: BRAND_WORKFLOW_AUTOMATION,
      imageAlt: "Multi-branch control and reporting UI",
      isMockup: true,
    },
    {
      id: "trust-scale",
      title: "Scaling Trust",
      description: (
        <>
          <p>
            The hardest part of entering a new market is building trust with
            wary savers. Because the cooperative used SusuFlow's instant SMS
            receipts, word quickly spread through the Accra markets.
          </p>
          <p>
            Traders felt secure knowing their money was instantly verified,
            allowing the cooperative to scale their daily deposit volume by 400%
            in a matter of months.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/market-scale.png",
      imageAlt: "Massive open air market showing rapid scale",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="Market Scale Story"
        description="Scaling from 5 to 50+ collectors across Kumasi & Accra markets. See how a leading cooperative rapidly deployed new agents, tracked daily targets in real-time, and managed a massive influx of new savers safely and efficiently."
        imageSrc="/marketing/why-susuflow/market-scale.png"
        imageAlt="A large bustling open-air market in Ghana"
        isMockup={false}
      />
      <MarketingTextBlock title="Growth Without the Growing Pains">
        <p>
          Scaling a traditional microfinance operation is historically
          difficult. Every time you add a new market or a new cohort of field
          agents, your administrative overhead multiplies. More agents mean more
          notebooks to audit, more cash to secure in transit, and exponentially
          higher chances of human error during end-of-month reconciliations.
          This friction effectively limits the speed at which ambitious MFIs can
          grow.
        </p>
        <p>
          SusuFlow was built to remove that ceiling. Because our platform is
          entirely cloud-based and automated, the marginal cost of adding a new
          field agent is virtually zero. You can expand from 5 collectors in a
          single Kumasi market to 50 collectors across the entire Greater Accra
          region, and your accounting team will not have to work a single extra
          minute on reconciliation.
        </p>
        <p>
          Our partners use SusuFlow not just as a tool to manage their existing
          business, but as a strategic growth engine. By eliminating the
          administrative drag of scaling, leadership teams can refocus all their
          energy on capturing new territory and innovating new loan products.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
