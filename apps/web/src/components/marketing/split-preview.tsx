import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";
import { MicroLabel } from "./micro-label";

export function SplitPreview({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  primaryCta,
  secondaryCta,
  flip = false,
  as = "h1",
  className,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  flip?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  const TitleTag = as;

  return (
    <section
      className={cn(
        "omnih-atmosphere bg-white dark:bg-twitter-dark",
        className,
      )}
    >
      <MarketingContainer className="grid items-center gap-10 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
        <div className={cn("max-w-xl", flip && "lg:order-2")}>
          <MicroLabel>{eyebrow}</MicroLabel>
          <TitleTag
            className={cn(
              "mt-4 text-balance text-[#1a1a1a] dark:text-white",
              as === "h1" ? "hero-title" : "omnih-h2",
            )}
          >
            {title}
          </TitleTag>
          <p className="omnih-body mt-5 text-pretty">{lead}</p>
          {primaryCta || secondaryCta ? (
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  className="ofx-btn ofx-btn-dark ofx-btn-lg"
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link href={secondaryCta.href} className="ofx-link">
                  {secondaryCta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={cn("relative", flip && "lg:order-1")}>
          <div className="relative aspect-[1.48] overflow-hidden">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority={as === "h1"}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
