import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import {
  BRAND_PLATFORM_OVERVIEW,
  BRAND_HERO_SHOWCASE,
  BRAND_WORKFLOW_AUTOMATION,
} from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Platform Capabilities | ${APP_NAME}`,
  description:
    "Enterprise-grade real-time reconciliation, telecommunications gateway integrations, and live ledger exports.",
};

export default function PlatformCapabilitiesPage() {
  const features = [
    {
      id: "reconciliation",
      title: "Automated Reconciliation",
      description: (
        <>
          <p>
            Reconciling daily Susu deposits used to take hours of manual data
            entry and cross-referencing. SusuFlow features a real-time,
            double-entry ledger that automatically balances every cedi.
          </p>
          <p>
            Our engine directly cross-references your internal ledger with the
            mobile money gateway's ledger. If a deposit is received, your books
            reflect it instantly. Never worry about balancing the books at
            midnight again.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Automated reconciliation dashboard view",
      isMockup: true,
    },
    {
      id: "integrations",
      title: "Gateway Integrations",
      description: (
        <>
          <p>
            SusuFlow acts as the middleware between your business and the
            largest telcos in Ghana. We provide native, seamless integrations
            with MTN MoMo, Telecel Cash, and AT Money via secure aggregators
            like Hubtel.
          </p>
          <p>
            You also get integrated automated SMS gateways. The moment a client
            deposits funds or a collector logs a payment, an instant,
            un-spoofable SMS receipt is fired off, providing unparalleled
            transparency.
          </p>
        </>
      ),
      imageSrc: BRAND_HERO_SHOWCASE,
      imageAlt: "Gateway integrations and telco connections",
      isMockup: true,
    },
    {
      id: "reporting",
      title: "Live Ledger & Reports",
      description: (
        <>
          <p>
            Make data-driven decisions with access to real-time financial
            reporting. Track your entire company's liquidity, outstanding loans,
            and daily deposit velocity from a single dashboard.
          </p>
          <p>
            Instantly export trial balances, comprehensive audit logs, and
            management balance sheets in PDF or CSV formats. Hand your auditors
            a pristine, mathematically perfect record of your business.
          </p>
        </>
      ),
      imageSrc: BRAND_WORKFLOW_AUTOMATION,
      imageAlt: "Live ledger and exportable financial reports",
      isMockup: true,
    },
  ];

  return (
    <>
      <ProductHero
        badge="Platform Capabilities"
        title="Enterprise technology for microfinance operators."
        description="Leverage deep integrations with Ghana's leading mobile networks, automated double-entry accounting, and instant financial reporting to scale your business securely."
        imageSrc="/marketing/product/susu-enterprise-tech.png"
        imageAlt="Diverse professional tech team analyzing financial data"
        isMockup={false}
      />
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
