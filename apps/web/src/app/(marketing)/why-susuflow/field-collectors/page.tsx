import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import { BRAND_HERO_SHOWCASE } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Field Collectors | ${APP_NAME}`,
  description:
    "Empower market agents with mobile collection tools & live tracking.",
};

export default function FieldCollectorsPage() {
  const features = [
    {
      id: "mobile-pos",
      title: "A Bank in Your Pocket",
      description: (
        <>
          <p>
            Equip your field agents with a powerful, intuitive mobile
            application that turns any smartphone into a fully-fledged Point of
            Sale terminal for microfinance.
          </p>
          <p>
            Agents can securely pull up client profiles, review savings goals,
            and initiate Mobile Money prompts without ever touching physical
            cash or paper receipts.
          </p>
        </>
      ),
      imageSrc: "/marketing/product/susu-field-collector.png",
      imageAlt: "Field collector holding mobile POS app",
      isMockup: false,
    },
    {
      id: "live-targets",
      title: "Real-Time Target Tracking",
      description: (
        <>
          <p>
            Keep your agents motivated and informed. The SusuFlow app provides
            collectors with a live dashboard showing their daily, weekly, and
            monthly collection targets.
          </p>
          <p>
            Instant visual feedback on their performance helps drive higher
            collection rates and fosters a healthy, competitive environment
            among your field teams.
          </p>
        </>
      ),
      imageSrc: BRAND_HERO_SHOWCASE,
      imageAlt: "Dashboard showing agent collection targets",
      isMockup: true,
    },
    {
      id: "trust",
      title: "Build Unshakeable Client Trust",
      description: (
        <>
          <p>
            In the market, trust is currency. When a collector uses SusuFlow,
            the saver receives an instant, un-spoofable SMS confirmation the
            second the deposit clears.
          </p>
          <p>
            This absolute transparency eliminates "he-said, she-said" disputes
            over missing notebook entries, establishing your agents as the most
            professional and trustworthy collectors in the market.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/cashless.png",
      imageAlt: "Market trader viewing instant SMS receipt",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="Field Collectors"
        description="Empower market agents with mobile collection tools & live tracking. Collectors can instantly view client profiles, process MoMo deposits, and track their daily targets without relying on easily-lost notebooks."
        imageSrc="/marketing/product/susu-field-collector.png"
        imageAlt="Field collector managing deposits in a market"
        isMockup={false}
      />
      <MarketingTextBlock title="Empowering the Frontlines">
        <p>
          Field collectors are the lifeblood of any Susu operation. They
          navigate crowded markets, build deep personal relationships with
          traders, and drive the daily liquidity that keeps the business
          running. Yet, for too long, they have been burdened with archaic
          tools—heavy, weather-prone paper notebooks and the massive security
          risk of carrying bulk cash.
        </p>
        <p>
          SusuFlow completely reimagines the collector experience. We believe
          that by giving field agents enterprise-grade technology in the palm of
          their hands, we empower them to work faster, safer, and with far
          greater confidence.
        </p>
        <p>
          With our mobile collection tools, an agent can serve twice as many
          clients in the same amount of time. They no longer worry about getting
          robbed, making math errors, or facing angry savers at the end of the
          month. Instead, they become highly respected, digitized financial
          representatives for their communities.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
