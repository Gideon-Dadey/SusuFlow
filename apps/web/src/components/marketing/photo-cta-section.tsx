import Image from "next/image";
import Link from "next/link";
import { HOME_CTA_IMAGE } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";

export function PhotoCtaSection({
  title = "Run collections without cash.",
  ctaLabel = "Get started",
  ctaHref = "/register",
  image = HOME_CTA_IMAGE,
  imageAlt = "Susu operators reviewing verified collections together",
}: {
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate flex min-h-[70svh] items-center overflow-hidden py-24 md:min-h-[80svh] md:py-32">
      <Image
        src={image}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" />
      <MarketingContainer className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="omnih-h2 text-white">{title}</h2>
          <div className="mt-8">
            <Link href={ctaHref} className="ofx-btn ofx-btn-dark ofx-btn-lg">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
