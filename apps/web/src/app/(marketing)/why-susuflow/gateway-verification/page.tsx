import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import { BRAND_PLATFORM_OVERVIEW } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `100% Gateway Verification | ${APP_NAME}`,
  description:
    "Guarantee every deposit hits the bank before crediting client balances.",
};

export default function GatewayVerificationPage() {
  const features = [
    {
      id: "deposit",
      title: "Secure the Source",
      description: (
        <>
          <p>
            In traditional microfinance, the risk window between a collector
            taking cash in the market and depositing it at the branch is
            dangerously large.
          </p>
          <p>
            With 100% gateway verification, we close that window. Deposits are
            processed directly through telco gateways (like MTN MoMo), meaning
            the cash is secured by institutional infrastructure the moment the
            saver confirms the transaction.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/verification.png",
      imageAlt: "Verified transaction on a mobile screen",
      isMockup: false,
    },
    {
      id: "ledger-sync",
      title: "Real-Time Ledger Sync",
      description: (
        <>
          <p>
            Our API directly polls telco aggregators. The instant a deposit
            successfully clears the gateway, SusuFlow automatically updates the
            saver's digital balance.
          </p>
          <p>
            This ensures that your internal liquidity metrics are always
            perfectly synchronized with the actual funds sitting in your
            corporate mobile money wallets.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Live ledger synchronization dashboard",
      isMockup: true,
    },
    {
      id: "capital-protection",
      title: "Total Capital Protection",
      description: (
        <>
          <p>
            By guaranteeing that every cedi hits the bank *before* it exists on
            your books, you protect the core capital of your business from
            transit theft, "borrowing," or loss.
          </p>
          <p>
            This absolute verification standard is exactly what large
            institutional investors and regulators want to see when evaluating
            an MFI's operational maturity.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/accounting.png",
      imageAlt: "Accountant reviewing secure financial data",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="100% Gateway Verification"
        description="Guarantee every deposit hits the bank before crediting client balances. With absolute verification, you protect the core capital of the business from transit risks and ensure regulatory compliance."
        imageSrc="/marketing/why-susuflow/verification.png"
        imageAlt="Glowing smartphone screen showing a verified transaction"
        isMockup={false}
      />
      <MarketingTextBlock title="Protecting the Core Capital">
        <p>
          One of the greatest existential threats to any scaling microfinance
          institution is transit risk. When field agents collect hundreds or
          thousands of physical cedis throughout the day, the company's core
          capital is essentially walking around a crowded market, highly
          vulnerable to theft, loss, or misappropriation.
        </p>
        <p>
          SusuFlow solves this by integrating deeply with Ghana's leading
          telecom aggregators like MTN Mobile Money and Telecel Cash. We enforce
          a strict philosophy: a deposit does not exist on your books until the
          gateway confirms the funds are locked in your corporate account.
        </p>
        <p>
          This 100% verification standard fundamentally changes the risk profile
          of microfinance. By shifting the security burden away from individuals
          walking through markets and onto encrypted, institutional-grade
          banking infrastructure, your MFI's capital is protected from the very
          first second it changes hands.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
