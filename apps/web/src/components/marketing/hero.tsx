"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "./marketing-container";
import { HeroProductShowcase } from "./hero-product-showcase";
import { cn } from "@/lib/utils";

type Audience = "company" | "saver";

const COPY = {
  company: {
    headline: (
      <>
        One platform for your susu company.
        <br />
        <span className="text-foreground">And every verified cedi.</span>
      </>
    ),
    description:
      "Run collectors, MoMo deposits, and real-time ledgers from one place. Save time, cut fraud, and scale cashless susu across Ghana.",
    primaryHref: "/contact?intent=demo",
    primaryLabel: "Get started for free",
    secondaryHref: "/how-it-works",
    secondaryLabel: "See how it works",
  },
  saver: {
    headline: (
      <>
        Save with your group.
        <br />
        <span className="text-secondary">Every deposit verified.</span>
      </>
    ),
    description:
      "Join your susu digitally. Pay through MTN MoMo, track your balance, and get proof for every contribution. No more “the collector took it.”",
    primaryHref: "/register",
    primaryLabel: "Join your susu",
    secondaryHref: "/how-it-works",
    secondaryLabel: "See how it works",
  },
} as const;

export function MarketingHero() {
  const [audience, setAudience] = useState<Audience>("company");
  const copy = COPY[audience];

  return (
    <section className="marketing-hero-platform bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="marketing-hero-platform-inner">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0 text-left lg:pt-0">
            <div className="mb-6 w-full lg:mb-6 lg:inline-flex lg:w-auto lg:flex-wrap lg:items-center lg:justify-start lg:gap-2">
              <span className="mb-2 hidden text-sm text-muted-foreground lg:mb-0 lg:inline">
                You are on
              </span>
              <div
                className="flex w-full rounded-none border border-border bg-card p-1 shadow-sm lg:inline-flex lg:w-auto"
                role="tablist"
                aria-label="Choose audience"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={audience === "company"}
                  className={cn(
                    "flex-1 rounded-none px-3 py-2.5 text-center text-[15px] font-bold transition-colors sm:px-4 sm:py-1.5 lg:flex-none",
                    audience === "company"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setAudience("company")}
                >
                  Susu companies
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={audience === "saver"}
                  className={cn(
                    "flex-1 rounded-none px-3 py-2.5 text-center text-[15px] font-bold transition-colors sm:px-4 sm:py-1.5 lg:flex-none",
                    audience === "saver"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setAudience("saver")}
                >
                  Switch to savers
                </button>
              </div>
            </div>

            <h1 className="marketing-hero-title text-balance text-foreground">
              {copy.headline}
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-[18px] leading-[30.6px] text-muted-foreground lg:mt-6 lg:max-w-lg">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-start">
              <Link href={copy.primaryHref} className="w-full lg:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-none px-6 text-[15px] font-bold shadow-[0_8px_24px_rgba(34,197,94,0.28)] lg:min-w-[12rem]"
                >
                  {copy.primaryLabel}
                </Button>
              </Link>
              <Link
                href={copy.secondaryHref}
                className="inline-flex w-full items-center justify-center gap-1.5 text-[15px] font-semibold text-secondary transition-colors hover:text-secondary/80 lg:w-auto lg:justify-start"
              >
                {copy.secondaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <HeroProductShowcase className="lg:justify-self-end" />
        </div>
      </MarketingContainer>
    </section>
  );
}
