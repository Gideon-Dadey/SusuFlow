import { Check } from "lucide-react";
import { PRICING_ROI } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingRoiSection() {
  return (
    <section className="border-t border-border bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-left">
          <p className="text-[17px] font-medium text-muted-foreground">
            Why upgrade
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            The cost of staying manual vs going digital
          </h2>
          <p className="mt-5 text-pretty text-[17px] leading-relaxed text-muted-foreground">
            Susu companies across Ghana still lose time and trust to cash
            disputes and manual books. SusuFlow pays for itself when collections
            are verified and records are always ready.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-none border border-border/70 lg:mt-12">
          <div className="grid grid-cols-2 border-b border-border/70 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-[17px]">
            <div className="px-4 py-3 sm:px-6 sm:py-4">Manual susu</div>
            <div className="border-l border-border/70 px-4 py-3 sm:px-6 sm:py-4">
              On SusuFlow
            </div>
          </div>
          {PRICING_ROI.map(({ manual, digital }) => (
            <div
              key={manual}
              className="grid grid-cols-2 border-b border-border/60 last:border-b-0"
            >
              <div className="px-4 py-4 text-[17px] text-muted-foreground sm:px-6">
                {manual}
              </div>
              <div className="flex items-start gap-2 border-l border-border/60 px-4 py-4 sm:px-6">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="text-[17px] font-medium text-foreground">
                  {digital}
                </span>
              </div>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
