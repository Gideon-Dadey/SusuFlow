import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import { BRAND_MOMO_PAY_SHOWCASE } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Cashless Market Collections | ${APP_NAME}`,
  description: "Direct Mobile Money wallet prompts right at the trader stall.",
};

export default function CashlessMarketCollectionsPage() {
  const features = [
    {
      id: "direct-prompt",
      title: "The Direct Prompt Push",
      description: (
        <>
          <p>
            Remove cash from the equation entirely. Our collector app integrates
            deeply with telco APIs to allow "push" prompts directly to a
            trader's mobile money wallet.
          </p>
          <p>
            The collector enters the deposit amount in the app, and the saver's
            phone immediately lights up requesting their secret PIN to authorize
            the transfer. It is fast, seamless, and completely cashless.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/cashless.png",
      imageAlt: "Mobile money prompt on a smartphone in a market",
      isMockup: false,
    },
    {
      id: "security",
      title: "Unmatched Physical Security",
      description: (
        <>
          <p>
            Carrying thousands of cedis through crowded markets makes collectors
            prime targets for theft. Cashless collections ensure that your
            agents are never holding large sums of physical cash.
          </p>
          <p>
            This not only protects your capital, but crucially protects the
            physical safety of your hardworking field teams.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/solutions.png",
      imageAlt: "Managers discussing improved security protocols",
      isMockup: false,
    },
    {
      id: "instant-settlement",
      title: "Instant Liquidity Settlement",
      description: (
        <>
          <p>
            When a trader enters their PIN, the funds are instantly transferred
            from their wallet into your MFI's corporate merchant account.
          </p>
          <p>
            Your business gains immediate access to the collected liquidity,
            allowing you to re-deploy capital into micro-loans much faster than
            waiting for end-of-day bank branch deposits.
          </p>
        </>
      ),
      imageSrc: BRAND_MOMO_PAY_SHOWCASE,
      imageAlt: "Instant mobile money settlement UI",
      isMockup: true,
    },
  ];

  return (
    <>
      <ProductHero
        title="Cashless Market Collections"
        description="Direct Mobile Money wallet prompts right at the trader stall. A collector simply initiates the deposit via their app, and the saver securely enters their PIN on their own device to confirm. The transaction is instantly recorded in your ledger."
        imageSrc="/marketing/why-susuflow/cashless.png"
        imageAlt="Mobile money prompt appearing on a smartphone in a market"
        isMockup={false}
      />
      <MarketingTextBlock title="The Future of the African Market is Digital">
        <p>
          The informal sector drives the Ghanaian economy, but its reliance on
          physical cash creates massive inefficiencies. For field collectors,
          walking through crowded markets with bags of cash is inherently
          dangerous. For the MFI, waiting until the end of the day for that cash
          to be deposited at a bank branch means losing out on hours of vital
          liquidity.
        </p>
        <p>
          SusuFlow leverages the explosive growth of Mobile Money in West Africa
          to eliminate physical cash from the collection cycle entirely. By
          turning every transaction into a direct digital exchange between a
          saver's mobile wallet and your corporate account, we bypass the
          physical vulnerabilities of traditional Susu.
        </p>
        <p>
          This shift doesn't just improve security—it fundamentally accelerates
          the velocity of your capital. When funds settle instantly, you can
          disburse loans faster, earn interest sooner, and serve your clients
          with unprecedented speed.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
