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
  title: `Bank-Grade Accounting | ${APP_NAME}`,
  description: "Complete transparency for auditors, partners, and regulators.",
};

export default function BankGradeAccountingPage() {
  const features = [
    {
      id: "institutional",
      title: "Attract Institutional Partners",
      description: (
        <>
          <p>
            To grow beyond a certain size, MFIs need capital from larger
            commercial banks or international NGOs. These institutions require
            rigorous financial transparency before they invest.
          </p>
          <p>
            SusuFlow's bank-grade accounting engine generates the exact
            standardized reporting, trial balances, and audit trails that
            institutional partners demand.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/solutions.png",
      imageAlt: "Executives discussing institutional partnerships",
      isMockup: false,
    },
    {
      id: "compliance",
      title: "Effortless Regulatory Compliance",
      description: (
        <>
          <p>
            Stay on the right side of the Bank of Ghana and other regulatory
            bodies. Our system is designed around core financial compliance
            standards.
          </p>
          <p>
            Generate mandated reports with a single click rather than spending
            weeks compiling data from spreadsheets, ensuring you never miss a
            filing deadline or fail a spot audit.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Automated regulatory compliance reporting",
      isMockup: true,
    },
    {
      id: "automation",
      title: "Automated Balance Sheets",
      description: (
        <>
          <p>
            Because every single deposit, withdrawal, penalty, and loan interest
            payment is captured in a strict double-entry format, your balance
            sheets construct themselves.
          </p>
          <p>
            Your accounting team can transition from performing tedious manual
            data entry to actually analyzing the financial health and trajectory
            of the business.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/accounting.png",
      imageAlt: "Accountant happily reviewing automated balance sheets",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="Bank-Grade Accounting"
        description="Complete transparency for auditors, partners, and regulators. Our double-entry accounting engine logs every action, timestamp, and user, generating automated balance sheets that mirror bank-grade financial reporting standards."
        imageSrc={BRAND_PLATFORM_OVERVIEW}
        imageAlt="Platform overview showing bank grade financial reports"
        isMockup={true}
      />
      <MarketingTextBlock title="Bridging the Gap to Institutional Finance">
        <p>
          Many microfinance operations hit a growth plateau not because they
          lack clients, but because they lack the pristine financial reporting
          required to secure large-scale institutional credit. Commercial banks
          and international NGOs want to invest in the grassroots economy, but
          they simply cannot deploy capital into organizations running on
          fragmented spreadsheets and manual ledgers.
        </p>
        <p>
          SusuFlow was built to bridge this exact gap. We bring the rigorous,
          double-entry accounting standards used by top-tier commercial banks
          and bake them directly into the daily workflow of a Susu collector.
          The system ensures that it is impossible to make a one-sided entry.
        </p>
        <p>
          The result is a permanent state of audit-readiness. When an external
          auditor or a potential partner reviews your books through SusuFlow,
          they see flawless balance sheets, traceable asset flows, and
          comprehensive income statements—elevating your operation from a local
          cooperative into an institutional-grade financial entity.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
