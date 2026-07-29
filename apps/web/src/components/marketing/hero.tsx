"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "./marketing-container";
import { HeroProductShowcase } from "./hero-product-showcase";

export function MarketingHero() {
  return (
    <section className="marketing-hero-platform bg-[#f4f6f8] dark:bg-background pb-12 lg:pb-20">
      <MarketingContainer className="marketing-hero-platform-inner">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0 text-left lg:pt-0">
            <h1 className="marketing-hero-title text-balance text-foreground font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight">
              One platform for your susu enterprise.
              <br />
              <span className="text-[#0056d2] dark:text-[#38bdf8]">
                And every verified cedi.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-[18px] leading-[30.6px] text-muted-foreground lg:mt-6 lg:max-w-lg">
              Run field collectors, gateway-confirmed MoMo deposits, and
              real-time double-entry ledgers from one place. Save time, cut
              fraud, and scale cashless operations across Ghana.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-start">
              <Link href="/contact?intent=demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-[0.2rem] bg-[#0056d2] hover:bg-[#0043aa] text-white px-6 text-[15px] font-bold shadow-[0_8px_24px_rgba(0,86,210,0.28)] sm:w-auto sm:min-w-[12rem] flex items-center justify-center gap-2"
                >
                  <span>Get started for free</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </Button>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex w-full items-center justify-center gap-1.5 text-[15px] font-semibold text-[#0056d2] dark:text-[#38bdf8] transition-colors hover:opacity-80 sm:w-auto sm:justify-start"
              >
                <span>See how it works</span>
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
