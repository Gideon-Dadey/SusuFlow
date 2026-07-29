import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";

export function AboutCtaSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Ready to modernize your susu company?
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            Request a demo or start a free trial. We will help you onboard
            collectors and run your first verified MoMo collection cycle.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:justify-center">
            <Link href="/contact?intent=demo" className="sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-none px-6 text-[15px] font-bold shadow-[0_8px_24px_rgba(34,197,94,0.28)] sm:min-w-[12rem]"
              >
                Get started
              </Button>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-none border border-border bg-white px-6 text-[15px] font-semibold text-foreground transition-colors hover:bg-muted/50 dark:border-border dark:bg-card dark:hover:bg-muted/50 sm:min-w-[11rem]"
            >
              View pricing
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
