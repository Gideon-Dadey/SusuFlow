import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import {
  BRAND_HERO_SHOWCASE,
  BRAND_WORKFLOW_AUTOMATION,
  BRAND_PLATFORM_OVERVIEW,
} from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Manage & Control | ${APP_NAME}`,
  description:
    "Secure your entire microfinance operation with multi-level approvals, branch management, and custom saving plans.",
};

export default function ManageAndControlPage() {
  const features = [
    {
      id: "branch-management",
      title: "Multi-Branch Management",
      description: (
        <>
          <p>
            Operating across multiple markets or regions? SusuFlow lets you
            effortlessly oversee your entire geographic footprint from a single,
            unified admin dashboard.
          </p>
          <p>
            Assign staff to specific branches, set distinct collection targets
            per market, and compare performance across your network. Maintain
            high-level oversight without getting bogged down in localized admin
            tasks.
          </p>
        </>
      ),
      imageSrc: BRAND_HERO_SHOWCASE,
      imageAlt: "SusuFlow dashboard showing branch performance metrics",
      isMockup: true,
    },
    {
      id: "control-hub",
      title: "Control Hub & Approvals",
      description: (
        <>
          <p>
            Internal fraud and accidental errors cost Susu companies millions of
            cedis annually. Our Control Hub implements strict access controls
            and role-based permissions to protect your ledgers.
          </p>
          <p>
            Configure custom approval workflows for payouts, large deposits, or
            ledger adjustments. Ensure that no significant financial action
            happens without dual sign-off from authorized managers.
          </p>
        </>
      ),
      imageSrc: BRAND_WORKFLOW_AUTOMATION,
      imageAlt: "Approval workflows and role-based permissions dashboard",
      isMockup: true,
    },
    {
      id: "savings-plans",
      title: "Flexible Savings & Loan Plans",
      description: (
        <>
          <p>
            Move beyond one-size-fits-all products. SusuFlow allows you to
            easily configure dynamic daily, weekly, or monthly savings plans
            tailored to your community's unique financial goals.
          </p>
          <p>
            Automatically deduct daily platform fees or commissions, and
            effortlessly manage micro-loan repayments integrated directly into
            the saver's daily deposit flow.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Platform showing various savings and loan configurations",
      isMockup: true,
    },
  ];

  return (
    <>
      <ProductHero
        badge="Manage & Control"
        title="Become the world's most relaxed operations manager."
        description="Stop worrying about who edited a ledger or which branch is underperforming. Set strict controls, mandate approvals, and scale your Susu operations with absolute confidence."
        imageSrc="/marketing/product/susu-office-manager.png"
        imageAlt="SusuFlow operations manager reviewing data"
        isMockup={false}
      />
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
