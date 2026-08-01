import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
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
    <section className="relative overflow-hidden bg-white dark:bg-background pb-14 pt-24 sm:pb-20 sm:pt-32 lg:pb-24 lg:pt-36">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#0066cc] to-[#ffcc00] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>

      <MarketingContainer>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="omnih-h1 text-4xl sm:text-5xl lg:text-6xl text-balance text-slate-900 dark:text-white mb-6">
              {title}
            </h1>
            <p className="omnih-body text-[17px] sm:text-[19px] text-pretty text-slate-600 dark:text-slate-400">
              {description}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="omnih-btn-primary h-14 w-full bg-[#0066cc] hover:bg-[#0052a3] text-white px-8 flex items-center gap-2 shadow-md transition-all"
                >
                  Get started
                  <ArrowRight className="h-[18px] w-[18px]" />
                </Button>
              </Link>
              <Link
                href="/pricing"
                className="text-[17px] font-semibold leading-6 text-slate-900 dark:text-white flex items-center gap-1 hover:text-[#0066cc] dark:hover:text-[#38bdf8] transition-colors"
              >
                View pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative w-full overflow-hidden aspect-[4/3] rounded-[1.75rem] shadow-md border border-border/40 bg-muted/30 sm:aspect-[16/11]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={cn(
                  isMockup
                    ? "object-contain object-center drop-shadow-xl p-4 lg:p-8"
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
