import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ABOUT_HERO_IMAGE } from "@/lib/brand-assets";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";

export function AboutHero() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 text-left">
            <SectionEyebrow>About us</SectionEyebrow>
            <h1 className="afrusan-hero-title text-balance !text-4xl sm:!text-5xl lg:!text-[3.5rem]">
              Choose SusuFlow for cashless susu you can trust.
            </h1>
            <p className="afrusan-body mt-5 max-w-xl text-pretty">
              For susu companies across Ghana, we built a better way to collect,
              reconcile, and pay out. Verified MoMo deposits, real-time ledgers,
              and collectors who never handle cash.
            </p>
            <p className="afrusan-body mt-4 max-w-xl text-pretty">
              Building on Ghana&apos;s susu heritage, SusuFlow gives operators
              the digital tools to collect with confidence, verify every MoMo
              deposit, and grow their member base without taking on unnecessary
              risk.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full px-8 font-medium sm:min-w-[12rem]"
                >
                  Register
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How it works
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl lg:max-w-none">
            <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
              <Image
                src={ABOUT_HERO_IMAGE}
                alt="Ghanaian susu company team reviewing SusuFlow on laptop and phone"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
