import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOW_IT_WORKS_DIGITAL_COLLECTOR } from "@/lib/brand-assets";
import { MarketingContainer } from "../marketing-container";

export function HowItWorksLocalSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-10 sm:gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="relative order-1 mx-auto w-full max-w-xl overflow-hidden rounded-none lg:order-1 lg:max-w-none">
            <div className="relative aspect-[4/3] w-full sm:aspect-[5/4]">
              <Image
                src={HOW_IT_WORKS_DIGITAL_COLLECTOR}
                alt="Credo collector helping a Ghanaian market trader pay via Mobile Money"
                fill
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="order-2 min-w-0 text-left lg:order-2">
            <p className="text-sm font-medium text-muted-foreground">
              Built for Ghana
            </p>
            <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
              Savers deposit directly. Cash leaves the process.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Susu contributors can deposit money directly into their Susu
              accounts from their own Mobile Money wallets at any time. No need
              for cash handoffs or waiting for a collector to visit.
            </p>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Credo is designed to empower Ghanaian savers: convenient
              self-service mobile money payments, instant digital receipts, and
              real-time dashboard verification for the Susu company.
            </p>
            <Link
              href="/contact?intent=demo"
              className="mt-8 inline-flex items-center gap-2 text-base font-semibold text-secondary transition-colors hover:text-secondary/80"
            >
              Talk to our team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
