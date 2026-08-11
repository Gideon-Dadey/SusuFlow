import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { APP_NAME } from "@/lib/marketing-data";
import { BRAND_PLATFORM_INTRO_IMAGE } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";
import { SectionEyebrow } from "./section-eyebrow";

export function PlatformOverviewSection() {
  return (
    <section className="afrusan-section bg-background">
      <MarketingContainer>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="min-w-0">
            <SectionEyebrow>Introduction</SectionEyebrow>
            <h2 className="afrusan-section-title text-balance">
              Transforming susu through verified MoMo deposits and a world-class
              operations model
            </h2>
            <p className="afrusan-body mt-5 max-w-xl text-pretty">
              {APP_NAME} was built for Ghanaian susu companies and microfinance
              operators with a goal of increasing trust in collections through
              gateway-verified Mobile Money deposits and scalable, audit-ready
              ledger programs.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-base font-medium text-foreground transition-opacity hover:opacity-70"
            >
              <span>Get to know us</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="relative">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Verified in the field
            </p>
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
              <Image
                src={BRAND_PLATFORM_INTRO_IMAGE}
                alt="SusuFlow field collector confirming a gateway-verified Mobile Money deposit with a market trader in Ghana"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
