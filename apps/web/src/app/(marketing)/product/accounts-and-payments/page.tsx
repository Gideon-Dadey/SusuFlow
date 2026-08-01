import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import {
  BRAND_MOMO_PAY_SHOWCASE,
  HOW_IT_WORKS_DIGITAL_COLLECTOR,
  BRAND_PLATFORM_OVERVIEW,
} from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Accounts, Payments & Cards | ${APP_NAME}`,
  description:
    "Collect, hold and manage daily Susu savings with 100% gateway verification and automated MoMo payouts.",
};

export default function AccountsAndPaymentsPage() {
  const features = [
    {
      id: "susu-accounts",
      title: "Digital Susu Accounts",
      description: (
        <>
          <p>
            Upgrade your savers from paper passbooks to real-time digital
            accounts. Every cedi deposited is instantly logged and verified
            against the gateway, ensuring 100% reconciliation and zero missing
            funds.
          </p>
          <p>
            Give your clients the peace of mind they deserve with SMS alerts for
            every transaction and clear, immutable balances that build trust and
            drive growth for your business.
          </p>
        </>
      ),
      imageSrc: BRAND_MOMO_PAY_SHOWCASE,
      imageAlt: "Verified Mobile Money deposit showing on SusuFlow",
      isMockup: true,
    },
    {
      id: "momo-payouts",
      title: "Instant MoMo Payouts",
      description: (
        <>
          <p>
            When it's time for clients to cash out their savings, completely
            eliminate the risk of handling bulk cash. Push payouts directly to
            their MTN, Telecel, or AT wallets in seconds.
          </p>
          <p>
            Secure your cash flow with our robust dual sign-off system. Require
            management approval for large payouts, ensuring complete control
            over outbound funds while delivering instant liquidity to your
            savers.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Admin dashboard showing MoMo payout approvals",
      isMockup: true,
    },
    {
      id: "collector-app",
      title: "Field Collector App",
      description: (
        <>
          <p>
            Equip your market agents with our dedicated mobile app. Say goodbye
            to easily lost notebooks and illegible handwriting. Collectors can
            instantly pull up client accounts, initiate deposits, and issue
            digital receipts.
          </p>
          <p>
            Track your agents in the field, monitor live collection targets, and
            guarantee that no collector handles cash unless authorized. Every
            collection is securely tethered to your central double-entry ledger.
          </p>
        </>
      ),
      imageSrc: "/marketing/product/susu-field-collector.png",
      imageAlt: "Ghanaian collector helping a trader with digital Susu",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        badge="Accounts & Payments"
        title="Modernize collection without losing offline trust."
        description="Transition your entire Susu operation to a secure, cashless environment. Manage digital accounts, automate mobile money payouts, and empower your field collectors with real-time tools."
        imageSrc="/marketing/product/susu-trader-payment.png"
        imageAlt="Susu collectors managing mobile payments"
        isMockup={false}
      />
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
