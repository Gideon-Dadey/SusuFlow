import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";
import { MicroLabel } from "./micro-label";

export function VisionQuoteSection({
  label,
  quote,
  attribution,
  className,
}: {
  label: string;
  quote: string;
  attribution?: string;
  className?: string;
}) {
  return (
    <section className={cn("bg-[#f7f7f7] dark:bg-slate-900", className)}>
      <MarketingContainer className="py-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <MicroLabel className="justify-center">{label}</MicroLabel>
          <blockquote className="mt-6 text-xl font-semibold leading-[1.55] tracking-tight text-[#1a1a1a] dark:text-white sm:text-2xl md:text-[1.75rem]">
            {quote}
          </blockquote>
          {attribution ? (
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              {attribution}
            </p>
          ) : null}
        </div>
      </MarketingContainer>
    </section>
  );
}
