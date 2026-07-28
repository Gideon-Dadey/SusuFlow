import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";

export function PricingCtaSection() {
  return (
    <section className="bg-[#f4f6f8] dark:bg-background">
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
            <Link
              href="/contact?intent=demo"
              className="inline-block w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="h-12 w-full rounded-none px-8 text-[15px] font-bold shadow-[0_8px_24px_rgba(34,197,94,0.28)] sm:min-w-[12rem]"
              >
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
