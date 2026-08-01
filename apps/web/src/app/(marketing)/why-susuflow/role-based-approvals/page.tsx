import type { Metadata } from "next";
import { ProductHero } from "@/components/marketing/product/product-hero";
import { ProductFeatureSection } from "@/components/marketing/product/product-feature-section";
import { MarketingTextBlock } from "@/components/marketing/marketing-text-block";
import { ApprovalWorkflowsCtaSection } from "@/components/marketing/approval-workflows-cta-section";
import { APP_NAME } from "@/lib/marketing-data";
import {
  BRAND_WORKFLOW_AUTOMATION,
  BRAND_PLATFORM_OVERVIEW,
} from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: `Role-Based Approvals | ${APP_NAME}`,
  description:
    "Enforce manager sign-off on withdrawals and plan modifications.",
};

export default function RoleBasedApprovalsPage() {
  const features = [
    {
      id: "multi-tier",
      title: "Multi-Tier Authorization",
      description: (
        <>
          <p>
            Protect your business from internal threats. Set up strict,
            multi-tier authorization workflows where significant actions—like
            large withdrawals or interest rate adjustments—cannot be executed by
            a single person.
          </p>
          <p>
            A junior officer can initiate a request, but it will sit in a
            pending state until a senior manager reviews and digitally signs
            off.
          </p>
        </>
      ),
      imageSrc: BRAND_WORKFLOW_AUTOMATION,
      imageAlt: "Multi-tier approval workflows UI",
      isMockup: true,
    },
    {
      id: "granularity",
      title: "Granular Access Control",
      description: (
        <>
          <p>
            Not everyone needs to see everything. SusuFlow allows you to define
            hyper-specific roles for your staff.
          </p>
          <p>
            A field collector only sees their assigned clients. A branch manager
            only sees their specific region's data. Only the executive dashboard
            holds the master keys, ensuring data privacy and operational
            security.
          </p>
        </>
      ),
      imageSrc: BRAND_PLATFORM_OVERVIEW,
      imageAlt: "Granular access control settings",
      isMockup: true,
    },
    {
      id: "accountability",
      title: "Total Accountability",
      description: (
        <>
          <p>
            When a modification occurs, the system logs exactly who requested
            it, who approved it, and at what time.
          </p>
          <p>
            This unbreakable chain of custody means that if an error or
            malicious action does occur, management can trace it back to the
            exact user accounts involved in seconds.
          </p>
        </>
      ),
      imageSrc: "/marketing/why-susuflow/accounting.png",
      imageAlt: "Accountant reviewing secure logs",
      isMockup: false,
    },
  ];

  return (
    <>
      <ProductHero
        title="Role-Based Approvals"
        description="Enforce manager sign-off on withdrawals and plan modifications. Maintain strict internal controls over your business capital and ensure that only authorized personnel can access sensitive operational controls, stopping internal fraud."
        imageSrc={BRAND_WORKFLOW_AUTOMATION}
        imageAlt="Role-based approvals dashboard UI"
        isMockup={true}
      />
      <MarketingTextBlock title="Trust Your Team, But Verify Everything">
        <p>
          As a microfinance institution grows, the founder or director can no
          longer oversee every single transaction. You have to delegate
          authority to branch managers, loan officers, and clerks. However,
          without strict software controls, this necessary delegation opens the
          door to internal fraud, unauthorized withdrawals, and reckless data
          modifications.
        </p>
        <p>
          SusuFlow's Role-Based Access Control (RBAC) engine is built to enforce
          operational hierarchy at the code level. It ensures that the principle
          of least privilege is applied automatically—meaning your staff only
          has access to the specific data and actions required to do their jobs,
          and absolutely nothing more.
        </p>
        <p>
          By enforcing mandatory manager sign-offs for sensitive actions, you
          remove the temptation for internal bad actors and create an
          environment where honest employees are protected by rigorous,
          undeniable system logs.
        </p>
      </MarketingTextBlock>
      <ProductFeatureSection features={features} />
      <ApprovalWorkflowsCtaSection />
    </>
  );
}
