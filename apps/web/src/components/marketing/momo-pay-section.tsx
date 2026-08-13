import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { BRAND_MOMO_PAY_SHOWCASE } from "@/lib/brand-assets";
import { BrandLogo } from "./brand-logo";
import { MarketingContainer } from "./marketing-container";
import { SectionEyebrow } from "./section-eyebrow";

function MomoPayBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 bg-[#ffcc00] px-3 py-1.5 text-sm font-bold tracking-tight text-[#1a1a1a] ${className ?? ""}`}
    >
      <span className="text-[0.65rem] font-extrabold uppercase tracking-wider">
        MTN
      </span>
      <span className="font extrabold leading-none">MoMo</span>
    </span>
  );
}

export function MomoPaySection() {
  return (
    <section className="afrusan-section bg-background">
      <MarketingContainer>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="min-w-0">
            <div className="mb-6 flex items-center gap-4">
              <BrandLogo className="h-8 max-w-[9rem]" />
              <MomoPayBadge />
            </div>

            <SectionEyebrow>Payments</SectionEyebrow>
            <h2 className="afrusan-section-title text-balance">
              {" "}
              MoMo Pay is integrated. A fast, secure, and local way to collect
              deposits.{" "}
            </h2>

            <p className="afrusan-body mt-5 max-w-xl text-pretty">
              Savers pay straight from their MoMo wallet. Collectors send
              prompts in the field, and every cedi is verified against the
              gateway before it hits the ledger. No cash handoffs, no disputed
              receipts.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/register"
                className="afrusan-cta-pill w-full sm:w-auto"
              >
                <span>Register</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                How MoMo deposits work
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[16rem] lg:max-w-none lg:justify-self-end">
            <div className="relative aspect-[9/16] w-full lg:max-h-[36rem]">
              <Image
                src={BRAND_MOMO_PAY_SHOWCASE}
                alt="SusuFlow mobile app showing a verified MTN MoMo Pay deposit"
                fill
                sizes="(max-width: 1024px) 52vw, 42vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
