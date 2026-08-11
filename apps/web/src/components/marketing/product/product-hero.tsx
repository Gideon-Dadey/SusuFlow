import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";
import { cn } from "@/lib/utils";

export interface ProductHeroProps {
  badge?: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  isMockup?: boolean;
}

export function ProductHero({
  badge,
  title,
  description,
  imageSrc,
  imageAlt,
  isMockup = false,
}: ProductHeroProps) {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 max-w-2xl text-left lg:order-1">
            {badge ? <SectionEyebrow>{badge}</SectionEyebrow> : null}
            <h1 className="afrusan-hero-title text-balance !text-4xl sm:!text-5xl lg:!text-[3.25rem]">
              {title}
            </h1>
            <p className="afrusan-body mt-5 text-pretty">{description}</p>
            <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="h-12 w-full px-8 font-medium sm:min-w-[11rem]"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground sm:justify-start"
              >
                View pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-xl lg:order-2 lg:max-w-none">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl sm:aspect-[16/11]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn(
                  isMockup
                    ? "object-contain object-center"
                    : "object-cover object-center",
                )}
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
