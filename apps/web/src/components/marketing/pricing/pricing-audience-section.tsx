import { PRICING_AUDIENCES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingAudienceSection() {
  return (
    <section className="border-t border-border bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-left">
          <p className="text-[17px] font-medium text-muted-foreground">
            Who it is for
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Pick the plan that matches how you operate today
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:mt-12">
          {PRICING_AUDIENCES.map(({ plan, title, description }) => (
            <article
              key={plan}
              className="rounded-none border border-border/70 bg-card p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-7"
            >
              <span className="text-xs font-bold uppercase tracking-wide text-secondary">
                {plan}
              </span>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
