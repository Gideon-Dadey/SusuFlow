import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_WORKFLOW_AUTOMATION } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";
import { SectionEyebrow } from "./section-eyebrow";

export function WorkflowAutomationSection() {
  return (
    <section className="afrusan-section bg-background">
      <MarketingContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/11]">
              <Image
                src={BRAND_WORKFLOW_AUTOMATION}
                alt="SusuFlow staff reviewing deposit approvals"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="order-1 max-w-xl space-y-5 lg:order-2">
            <SectionEyebrow>Streamline workflows</SectionEyebrow>
            <h2 className="afrusan-section-title">
              Automate your deposit &amp; payout approvals
            </h2>
            <p className="afrusan-body text-pretty">
              SusuFlow helps streamline collections with tailored approval
              workflows. Set clear rules for collector actions, MoMo deposit
              verification, payout sign-offs, and staff access — so every cedi
              moves with accountability.
            </p>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-base font-medium text-foreground transition-opacity hover:opacity-70"
            >
              <span>Deposit automation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
