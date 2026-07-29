import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_WORKFLOW_AUTOMATION } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";

export function WorkflowAutomationSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-1 min-w-0 text-left lg:order-1">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Streamline workflows
            </p>
            <h2 className="mt-2 text-balance text-xl sm:text-3xl lg:text-[2.35rem] font-bold leading-snug tracking-tight text-foreground">
              Automate your deposit &amp; payout approvals
            </h2>
            <p className="mt-4 sm:mt-5 max-w-lg text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
              Credo helps streamline collections with tailored approval
              workflows. Set clear rules for collector actions, MoMo deposit
              verification, payout sign-offs, and staff access, so every cedi
              moves with accountability.
            </p>
            <Link
              href="/how-it-works"
              className="mt-6 inline-flex items-center gap-2 text-base font-bold text-muted-foreground transition-colors hover:text-foreground lg:mt-8"
            >
              <span>Deposit automation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative order-2 mx-auto w-full max-w-xl lg:order-2 lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[5/4] shadow-2xl border border-slate-200/80 dark:border-white/10">
              <Image
                src={BRAND_WORKFLOW_AUTOMATION}
                alt="Credo staff reviewing deposit approvals in a modern office"
                fill
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-black/5"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
