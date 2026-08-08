"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_HERO_IMAGE } from "@/lib/brand-assets";
import { APP_TAGLINE } from "@/lib/marketing-data";
import { MarketingContainer } from "./marketing-container";

export function MarketingHero() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14 xl:gap-20">
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-muted-foreground">
              Enterprise susu platform
            </p>

            <h1 className="afrusan-hero-title mt-4 text-balance text-left !text-[2.35rem] !leading-[1.08] sm:!text-5xl lg:!text-[3.35rem] xl:!text-[3.75rem]">
              The Operating System for Modern Susu Enterprises.
            </h1>

            <p className="afrusan-body mt-6 max-w-xl text-pretty">
              {APP_TAGLINE} Our mission is to eliminate manual collection fraud
              with gateway-confirmed Mobile Money deposits and audit-ready
              double-entry ledgers.
            </p>

            <p className="afrusan-body mt-4 max-w-xl text-pretty">
              We aim to prove that susu operations can be simple, effective, and
              scalable for Ghanaian microfinance enterprises — starting with a
              free trial.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="afrusan-cta-pill w-full sm:w-auto"
              >
                <span>Get started free</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex w-full items-center justify-center gap-2 text-base font-medium text-foreground transition-opacity hover:opacity-70 sm:w-auto"
              >
                <span>See how it works</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[28rem] lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
              <Image
                src={BRAND_HERO_IMAGE}
                alt="SusuFlow dashboard on tablet and mobile showing verified MoMo susu deposits and collection analytics"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
