import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND_MOMO_PAY_SHOWCASE } from "@/lib/brand-assets";
import { BrandLogo } from "./brand-logo";
import { MarketingContainer } from "./marketing-container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MomoPayBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-[#ffcc00] px-3 py-1.5 text-sm font-bold tracking-tight text-[#1a1a1a] shadow-sm",
        className,
      )}
    >
      <span className="text-[0.7rem] font-extrabold uppercase tracking-wider">
        MTN
      </span>
      <span className="text-base font-extrabold leading-none">MoMo</span>
    </span>
  );
}

export function MomoPaySection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="pt-2 pb-10 sm:pt-6 sm:pb-16 lg:py-24">
        <div className="flex flex-col gap-6 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-2 min-w-0 text-left lg:order-1">
            <div className="mb-6 flex items-center justify-start gap-4 lg:mb-8">
              <BrandLogo className="h-8 max-w-[9rem] sm:max-w-[10rem]" />
              <span className="h-9 w-px shrink-0 bg-border" aria-hidden />
              <MomoPayBadge />
            </div>

            <h2 className="text-balance text-3xl font-bold leading-snug tracking-tight sm:text-4xl lg:text-[2.65rem] sm:leading-[1.15]">
              <span className="text-[#e8a317]">MoMo Pay is integrated.</span>{" "}
              <span className="text-foreground">
                a fast, secure, and local way to collect deposits.
              </span>
            </h2>

            <p className="mt-4 sm:mt-5 max-w-lg text-pretty text-base sm:text-lg leading-relaxed text-muted-foreground lg:mt-6">
              Savers pay straight from their MoMo wallet. Collectors send
              prompts in the field, and every cedi is verified against the
              gateway before it hits the ledger. No cash handoffs, no disputed
              receipts.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:justify-start">
              <Link href="/contact?intent=demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-none px-6 text-base font-bold shadow-sm sm:min-w-[10.5rem]"
                >
                  Get started
                </Button>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-1.5 text-base font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                How MoMo deposits work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-[13rem] sm:max-w-[16rem] lg:order-2 lg:max-w-none lg:justify-self-end">
            <div
              className="pointer-events-none absolute -right-2 top-1/2 hidden h-[70%] w-[80%] -translate-y-1/2 rounded-full bg-[#ffcc00]/12 blur-3xl lg:block"
              aria-hidden
            />
            <div className="relative h-[15.5rem] w-full sm:h-[19rem] lg:aspect-[9/16] lg:h-auto lg:max-h-[36rem]">
              <Image
                src={BRAND_MOMO_PAY_SHOWCASE}
                alt="SusuFlow mobile app showing a verified MTN MoMo Pay deposit with Done confirmation"
                fill
                sizes="(max-width: 1024px) 52vw, 42vw"
                className="object-contain object-center drop-shadow-[0_20px_40px_rgba(15,23,42,0.12)] lg:object-bottom lg:drop-shadow-[0_32px_64px_rgba(15,23,42,0.16)]"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
