import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MOMO_PAY_CAPABILITIES } from "@/lib/marketing-data";
import { MarketingContainer } from "./marketing-container";
import { cn } from "@/lib/utils";

export function MomoPayCapabilitiesSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-2 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:order-1">
            {MOMO_PAY_CAPABILITIES.map(({ label, icon }) => {
              return (
                <div
                  key={label}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-none bg-transparent px-3 py-5 text-center",
                  )}
                >
                  <FontAwesomeIcon
                    icon={icon}
                    className="h-8 w-8 text-[#111827] dark:text-foreground sm:h-9 sm:w-9"
                    aria-hidden
                  />
                  <span className="mt-4 text-xs font-semibold leading-snug text-[#111827] dark:text-foreground sm:text-base">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="order-1 min-w-0 text-left lg:order-2">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
              A simple end-to-end solution to help your susu thrive
            </h2>
            <p className="mt-5 text-base text-muted-foreground leading-relaxed text-pretty max-w-xl">
              Forget juggling cash, WhatsApp screenshots, and manual books.
              Collect MoMo deposits, verify payments, and reconcile ledgers from
              one platform with just a few taps in the field.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed text-pretty max-w-xl">
              MoMo prompts, gateway verification, collector tools, live
              dashboards, group payouts, and audit-ready records, built for how
              Ghanaian susu actually runs.
            </p>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
