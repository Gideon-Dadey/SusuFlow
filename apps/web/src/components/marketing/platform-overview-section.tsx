import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_PLATFORM_OVERVIEW } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";
import { cn } from "@/lib/utils";

export function PlatformOverviewSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="pt-10 pb-5 sm:pt-16 sm:pb-10 lg:py-24">
        <div className="flex flex-col gap-6 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-2 min-w-0 text-left lg:order-1">
            <h2 className="text-balance text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              Control everything.
              <br />
              See everything.
              <br />
              All in one place.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:mt-6">
              Forget juggling books, WhatsApp receipts, and collector disputes.
              Run contributions, payouts, and MoMo verification from one
              streamlined platform built for Ghanaian susu.
            </p>
            <Link
              href="/how-it-works"
              className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-muted-foreground transition-colors hover:text-foreground lg:mt-8"
            >
              <span>Explore the platform</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={cn(
              "relative order-1 mx-auto w-full max-w-[36rem] lg:order-2 lg:max-w-none lg:justify-self-end",
            )}
          >
            <div
              className="pointer-events-none absolute -left-4 top-1/2 hidden h-3/4 w-3/4 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl lg:block"
              aria-hidden
            />
            <div className="relative aspect-[4/3] w-full max-h-[14rem] sm:max-h-none sm:aspect-[16/11] lg:aspect-[5/4]">
              <Image
                src={BRAND_PLATFORM_OVERVIEW}
                alt="Credo admin dashboard on tablet, mobile saver app, and verified MoMo card"
                fill
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-contain object-center drop-shadow-[0_28px_56px_rgba(15,23,42,0.14)]"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
