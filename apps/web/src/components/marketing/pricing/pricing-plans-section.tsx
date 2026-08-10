import Link from "next/link";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "../marketing-container";

type Plan = (typeof PRICING_PLANS)[number];

function PlanCard({ plan }: { plan: Plan }) {
  const dark = plan.highlighted;

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[1.75rem] p-7 sm:p-8",
        dark
          ? "ofx-dark-section border border-transparent"
          : "ofx-card overflow-visible",
      )}
      style={dark ? { backgroundColor: "var(--ofx-ink)" } : undefined}
    >
      {plan.popular ? (
        <span className="absolute right-6 top-6 rounded-full bg-[var(--ofx-flame)] px-3 py-1 text-xs font-semibold text-white">
          Most popular
        </span>
      ) : null}

      <h2 className="ofx-h3">{plan.name}</h2>

      <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
        <span className="text-4xl font-semibold tracking-tight text-foreground">
          {plan.price}
        </span>
        {plan.period ? (
          <span className="text-base text-muted-foreground">{plan.period}</span>
        ) : null}
      </p>

      <p className="ofx-body mt-4">{plan.audience}</p>

      <div className="mt-7 flex-1 border-t border-border/70 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {plan.featureLabel}
        </p>
        <div className="mt-5 space-y-5">
          {plan.featureGroups.map((group) => (
            <div key={group.title ?? "features"}>
              {group.title ? (
                <p className="mb-2.5 text-[15px] font-semibold text-foreground">
                  {group.title}
                </p>
              ) : null}
              <ul className="space-y-2.5">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-[15px] leading-snug text-foreground"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ofx-flame)]"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={plan.ctaHref}
        className={cn(
          "mt-8 w-full justify-center text-center",
          dark
            ? "ofx-btn ofx-btn-cream"
            : plan.name === "Starter"
              ? "ofx-btn ofx-btn-dark"
              : "ofx-btn ofx-btn-outline",
        )}
      >
        {plan.cta}
      </Link>
    </article>
  );
}

export function PricingPlansSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="pb-20 pt-10 lg:pb-24 lg:pt-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
