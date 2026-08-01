import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import {
  BRAND_PLATFORM_OVERVIEW,
  BRAND_WORKFLOW_AUTOMATION,
} from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Susu Companies & MFIs | ${APP_NAME}`,
  description:
    "Purpose-built software for Ghanaian microfinance operators to scale safely.",
};

export default function SusuCompaniesPage() {
  const features = [
    {
      id: "multi-branch",
      title: "Centralize Multi-Branch Operations",
      description: (
        <>
          <p>
            Managing multiple market branches no longer requires endless phone
            calls and disjointed spreadsheets. SusuFlow brings your entire
            microfinance operation into a single, unified command center.
          </p>
          <p>
            Monitor live collections, track agent performance across different
            regions, and instantly spot liquidity trends from any device,
            anywhere in the world.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Centralized dashboard for MFI operations",
      isMockup: true,
    },
    {
      id: "risk-mitigation",
      title: "Eliminate Operational Risk",
      description: (
        <>
          <p>
            Traditional Susu models expose MFIs to massive transit and fraud
            risks. We replace paper notebooks with a cryptographically secure,
            double-entry digital ledger.
          </p>
          <p>
            Every transaction is instantly verified against telco gateways,
            meaning client balances are only updated when the cash is
            definitively secured in your corporate accounts.
          </p>
        </>
      ),
      imageSrc: BRAND_WORKFLOW_AUTOMATION,
      imageAlt: "Automated risk mitigation workflows",
      isMockup: true,
    },
    {
      id: "growth",
      title: "Scale Without Overhead",
      description: (
        <>
          <p>
            Adding 50 new field collectors used to mean hiring more data entry
            clerks to reconcile their books. With SusuFlow, scaling your
            workforce costs zero additional administrative overhead.
          </p>
          <p>
            Our automated reconciliation engine handles 10 transactions or
            10,000 transactions with the exact same flawless accuracy, freeing
            your capital to be deployed into actual growth.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/solutions.png",
      imageAlt: "MFI directors discussing scalable growth",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="Susu Companies & MFIs"
        description="Purpose-built software for Ghanaian microfinance operators to scale safely. By digitizing operations, we remove the friction of manual bookkeeping and replace it with a highly secure, automated platform."
        imageSrc="/marketing/why-susuflow/solutions.png"
        imageAlt="Ghanaian microfinance managers discussing software"
        isMockup={false}
      />
      <MarketingTextBlock title="The Foundation of Modern Microfinance">
        <p>
          For decades, the Ghanaian microfinance sector has relied on physical
          ledgers, trust-based relationships, and manual reconciliation. While
          these methods built the foundation of community banking, they simply
          cannot scale safely in today's fast-paced, digital-first economy.
        </p>
        <p>
          SusuFlow was engineered from the ground up specifically for Susu
          operators and Microfinance Institutions (MFIs). We understood that
          generic accounting software couldn't handle the unique daily
          collection cycles, rapid micro-loan disbursements, and field-heavy
          nature of the business.
        </p>
        <p>
          By digitizing the entire lifecycle—from the moment a cedi leaves a
          trader's hand to the moment it hits your corporate bank
          account—SusuFlow transforms microfinance operators into robust,
          institutional-grade financial powerhouses capable of unlimited,
          risk-free growth.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
