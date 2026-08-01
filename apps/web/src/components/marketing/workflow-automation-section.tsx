import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_WORKFLOW_AUTOMATION } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";

export function WorkflowAutomationSection() {
  return (
    <section className="bg-background py-12 lg:py-20 border-t border-border/40">
      <MarketingContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Left Column: Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-[1.75rem] overflow-hidden shadow-md border border-border/40 bg-muted/30 aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src={BRAND_WORKFLOW_AUTOMATION}
                alt="SusuFlow staff reviewing deposit approvals in a modern office"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column: Text Content */}
          <div className="order-1 lg:order-2 space-y-4 sm:space-y-6 max-w-xl">
            <span className="text-sm font-medium tracking-wide text-muted-foreground block">
              Streamline workflows
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
              Automate your deposit &amp; payout approvals
            </h2>

            <p className="text-[17px] text-muted-foreground leading-relaxed text-pretty">
              SusuFlow helps streamline collections with tailored approval
              workflows. Set clear rules for collector actions, MoMo deposit
              verification, payout sign-offs, and staff access, so every cedi
              moves with accountability.
            </p>

            <div className="pt-2">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#0066cc] hover:text-[#0052a3] transition-colors group"
              >
                <span>Deposit automation</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
