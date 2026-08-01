import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";

export function PricingCtaSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Have you picked your plan? Start your free trial.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            We will help you set up your tenant, onboard collectors, and run
            your first verified MoMo collection cycle.
          </p>
          <div className="mt-8 lg:flex lg:justify-center">
            <Link href="/register" className="inline-block w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white px-7 text-[17px] font-semibold flex items-center justify-center gap-2.5 shadow-sm sm:min-w-[12rem]"
              >
                <span>Get started</span>
                <ArrowRight
                  className="h-[18px] w-[18px] stroke-[2.25]"
                  aria-hidden
                />
              </Button>
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
