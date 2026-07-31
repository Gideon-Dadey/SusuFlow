import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MOMO_PAY_CAPABILITIES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";
import { cn } from "@/lib/utils";

export function PricingIncludedSection() {
  return (
    <section className="border-t border-border bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-left">
          <p className="text-sm font-medium text-muted-foreground">
            Included on every plan
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Core platform capabilities across all tiers
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
            Every plan includes the same verified MoMo foundation. Higher tiers
            add scale, roles, and support for growing susu companies.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-12">
          {MOMO_PAY_CAPABILITIES.map(({ label, icon }) => {
            return (
              <div
                key={label}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-none bg-[#f3f4f6] dark:bg-card px-3 py-5 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]",
                )}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className="h-8 w-8 text-[#111827] dark:text-foreground sm:h-9 sm:w-9"
                  aria-hidden
                />
                <span className="mt-4 text-xs font-semibold leading-snug text-[#111827] dark:text-foreground sm:text-sm">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
