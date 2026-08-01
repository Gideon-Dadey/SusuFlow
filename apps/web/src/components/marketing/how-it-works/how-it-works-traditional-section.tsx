import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { HOW_IT_WORKS_TRADITIONAL_PAINS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";
import { cn } from "@/lib/utils";

export function HowItWorksTraditionalSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-20">
          <div className="order-1 min-w-0 text-left lg:order-1">
            <p className="text-sm font-medium text-muted-foreground">
              For traditional operators
            </p>
            <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
              Still running susu the old way? You are not alone.
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-[17px] leading-relaxed text-muted-foreground">
              Market traders, savings clubs, and susu companies across Ghana
              still rely on notebooks, cash collection, and informal receipts.
              That model works until a payment is disputed or a collector cannot
              prove what was collected.
            </p>
            <p className="mt-4 max-w-lg text-pretty text-[17px] leading-relaxed text-muted-foreground">
              SusuFlow does not replace your collectors or your community trust.
              It gives your company gateway verified deposits, live balances,
              and records your auditors can export.
            </p>
          </div>

          <div className="order-2 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:order-2">
            {HOW_IT_WORKS_TRADITIONAL_PAINS.map(({ label, icon }) => {
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
        </div>
      </MarketingContainer>
    </section>
  );
}
