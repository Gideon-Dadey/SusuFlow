import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import { BRAND_HERO_SHOWCASE } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Zero Notebook Fraud | ${APP_NAME}`,
  description:
    "How partner MFIs eliminated ledger disputes & missing cash in 30 days.",
};

export default function ZeroNotebookFraudPage() {
  const features = [
    {
      id: "immutable",
      title: "Immutable Digital Ledgers",
      description: (
        <>
          <p>
            Paper notebooks can be lost, damaged, or intentionally altered.
            SusuFlow replaces physical records with a secure, cloud-based ledger
            that cannot be tampered with.
          </p>
          <p>
            Once a transaction is verified and logged, it is permanently etched
            into the system's history, completely eliminating the opportunity
            for post-collection manipulation.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/fraud.png",
      imageAlt: "Manager replacing paper notebooks with a digital tablet",
      isMockup: false,
    },
    {
      id: "sms-receipts",
      title: "Instant SMS Truth",
      description: (
        <>
          <p>
            Fraud thrives in ambiguity. By instantly firing off an automated SMS
            receipt to the saver's phone the moment a deposit clears, both
            parties immediately share the exact same truth.
          </p>
          <p>
            If a collector attempts to log a lower amount than handed over, the
            saver is instantly alerted, stopping discrepancies right at the
            stall.
          </p>
        </>
      ),
      imageSrc: BRAND_HERO_SHOWCASE,
      imageAlt: "Automated SMS receipt system",
      isMockup: true,
    },
    {
      id: "disputes",
      title: "Zero Ledger Disputes",
      description: (
        <>
          <p>
            Before SusuFlow, end-of-month reconciliations often devolved into
            arguments between savers claiming they paid, and collectors claiming
            they didn't.
          </p>
          <p>
            Our partner MFIs report a 100% reduction in these disputes within 30
            days of deployment. The digital trail is absolute, fostering trust
            and protecting the company's reputation.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/market-scale.png",
      imageAlt: "Peaceful, thriving market with zero disputes",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="Zero Notebook Fraud"
        description="How partner MFIs eliminated ledger disputes & missing cash in 30 days. By digitizing receipts and enabling immediate SMS confirmations, savers and companies share a single source of truth, making fraud virtually impossible."
        imageSrc="/marketing/why-susuflow/fraud.png"
        imageAlt="Operations manager safely transitioning from paper notebooks"
        isMockup={false}
      />
      <MarketingTextBlock title="The True Cost of Paper">
        <p>
          The notebook has been the symbol of the Susu collector for
          generations. But underneath its familiar cover lies a massive
          vulnerability for microfinance businesses. Ink fades, pages tear, and
          numbers can be subtly altered after a collector leaves the market.
          When a saver insists they handed over 50 cedis and the notebook only
          shows 20, the resulting dispute destroys the one thing a microfinance
          institution relies on most: community trust.
        </p>
        <p>
          SusuFlow was engineered to permanently eliminate this ambiguity. We
          approach fraud not just by finding bad actors, but by building a
          system architecture where fraud is structurally impossible to commit.
        </p>
        <p>
          By demanding dual-verification—where the collector logs the payment
          and the saver instantly receives a digital receipt on their own
          device—we create an unbreakable chain of truth. When the truth is
          instantaneous and transparent, trust flourishes and operations scale
          seamlessly.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
