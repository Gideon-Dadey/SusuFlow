import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOW_IT_WORKS_GHANIAN_MARKET } from "@/lib/brand-assets";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";

export function HowItWorksHero() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 text-left">
            <SectionEyebrow>How SusuFlow works</SectionEyebrow>
            <h1 className="afrusan-hero-title text-balance !text-4xl sm:!text-5xl lg:!text-[3.5rem]">
              Move your susu company from notebooks to verified MoMo.
            </h1>
            <p className="afrusan-body mt-5 max-w-xl text-pretty">
              Built for Ghanaian susu operators still collecting cash, chasing
              WhatsApp screenshots, and reconciling by hand. SusuFlow keeps your
              relationships in the field and puts every cedi on a verified
              digital ledger.
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
                href="/pricing"
                className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl lg:max-w-none">
            <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
              <Image
                src={HOW_IT_WORKS_GHANIAN_MARKET}
                alt="Ghanaian market trader using a smartphone for digital susu savings"
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
