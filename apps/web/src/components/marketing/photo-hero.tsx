import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";

export function PhotoHero({
  brand = "SusuFlow",
  title,
  support,
  image,
  imageAlt,
  primaryCta,
  secondaryCta,
}: {
  brand?: string;
  title: string;
  support: string;
  image: string;
  imageAlt: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />

      <MarketingContainer className="relative flex min-h-[100svh] flex-col justify-end pb-16 pt-16 sm:pb-20 md:pb-28 md:pt-20">
        <div className="max-w-3xl">
          <p className="omnih-micro text-white/80">
            <span className="omnih-micro-dot bg-white" aria-hidden />
            {brand}
          </p>
          <h1 className="hero-title mt-4 text-balance text-white">{title}</h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            {support}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="ofx-btn ofx-btn-dark ofx-btn-lg"
            >
              {primaryCta.label}
            </Link>
            {secondaryCta ? (
              <Link
                href={secondaryCta.href}
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-white transition-opacity hover:opacity-80",
                )}
              >
                {secondaryCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
