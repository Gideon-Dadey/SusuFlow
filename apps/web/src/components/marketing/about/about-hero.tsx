import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ABOUT_HERO_IMAGE } from "@/lib/brand-assets";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";

export function AboutHero() {
  return (
    <section className="bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="marketing-hero-platform-inner">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-muted-foreground">
              About us
            </p>
            <h1 className="marketing-hero-title mt-3 text-balance text-foreground">
              Choose SusuFlow for cashless susu you can trust.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:mt-6">
              For susu companies across Ghana, we built a better way to collect,
              reconcile, and pay out. Verified MoMo deposits, real time ledgers,
              and collectors who never handle cash.
            </p>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
              Building on Ghana&apos;s susu heritage, SusuFlow gives operators
              control over daily collections with Mobile Money integration,
              staff workflows, and audit ready records backed by responsive
              specialist support.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link href="/contact?intent=demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-none px-6 text-[15px] font-bold shadow-[0_8px_24px_rgba(34,197,94,0.28)] lg:min-w-[12rem]"
                >
                  Request a demo
                </Button>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex w-full items-center justify-center gap-1.5 text-[15px] font-semibold text-secondary transition-colors hover:text-secondary/80 sm:w-auto sm:justify-start"
              >
                How it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-none lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
              <Image
                src={ABOUT_HERO_IMAGE}
                alt="Ghanaian susu company team reviewing SusuFlow on laptop and phone"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
