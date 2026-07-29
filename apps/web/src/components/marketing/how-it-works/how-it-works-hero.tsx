import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOW_IT_WORKS_GHANIAN_MARKET } from "@/lib/brand-assets";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";

export function HowItWorksHero() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="marketing-hero-platform-inner">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 xl:gap-16">
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-muted-foreground">
              How Credo works
            </p>
            <h1 className="marketing-hero-title mt-3 text-balance text-foreground">
              Move your susu company from notebooks to verified MoMo.
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:mt-6">
              Built for Ghanaian susu operators still collecting cash, chasing
              WhatsApp screenshots, and reconciling by hand. Credo keeps your
              relationships in the field and puts every cedi on a verified
              digital ledger.
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
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:w-auto sm:justify-start"
              >
                View pricing
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-none lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
              <Image
                src={HOW_IT_WORKS_GHANIAN_MARKET}
                alt="Ghanaian market trader using a smartphone for digital susu savings"
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
