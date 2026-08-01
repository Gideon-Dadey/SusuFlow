import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/marketing-data";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
import { cn } from "@/lib/utils";

export function PricingPlansSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="marketing-hero-platform-inner pb-14 sm:pb-16 lg:pb-20">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h1 className="sr-hero-title text-balance text-foreground">
            Plans to suit your susu company, no matter the size.
          </h1>
          <p className="sr-hero-copy mt-5 text-pretty text-muted-foreground lg:mx-auto lg:max-w-2xl">
            Start with a free trial, scale with verified MoMo collections, and
            grow into multi branch operations. No per deposit fees. You pay for
            the platform, not every transaction.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:gap-8 lg:mt-14 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-[1.25rem] border bg-white p-6 text-center shadow-sm dark:bg-card dark:shadow-none sm:p-8",
                plan.popular
                  ? "border-[#e87722]"
                  : "border-border/80 dark:border-border",
              )}
            >
              {plan.popular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white px-2 dark:bg-card">
                  <span className="inline-flex rounded-full border border-[#e87722] px-3 py-0.5 text-[11px] font-semibold text-[#e87722]">
                    Most Popular
                  </span>
                </div>
              ) : null}

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {plan.name}
              </h2>
              <p className="mx-auto mt-4 max-w-[16rem] text-[17px] leading-relaxed text-muted-foreground sm:max-w-[18rem]">
                {plan.audience}
              </p>

              <div className="mt-8">
                <p
                  className={cn(
                    "font-bold tracking-tight text-foreground tabular-nums",
                    plan.name === "Custom"
                      ? "text-3xl sm:text-[2rem]"
                      : "text-5xl sm:text-[3.25rem]",
                  )}
                >
                  {plan.price}
                </p>
                {plan.period ? (
                  <p className="mt-3 text-[17px] text-muted-foreground">
                    {plan.period}
                  </p>
                ) : (
                  <span className="mt-3 block h-[1.25rem]" aria-hidden />
                )}
              </div>

              {plan.name === "Custom" ? (
                <div className="mt-8 flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="What's your work email?"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2.5 text-[17px] shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    size="lg"
                    className="h-11 w-full rounded-md bg-[#333] text-white hover:bg-[#222] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-[17px] font-medium"
                  >
                    {plan.cta}
                  </Button>
                </div>
              ) : (
                <Link href={plan.ctaHref} className="mt-8 block">
                  <Button
                    size="lg"
                    className={cn(
                      "h-11 w-full rounded-md text-[17px] font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5",
                      "bg-[#0066cc] text-white hover:bg-[#0052a3]",
                    )}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
              )}

              <div className="mt-10 flex-1 text-left">
                <p className="text-[17px] font-bold text-foreground">
                  {plan.featureLabel}
                </p>
                <ul className="mt-5 space-y-4">
                  {plan.featureGroups.map((group) => (
                    <li key={group.title ?? "features"}>
                      {group.title ? (
                        <p className="mb-3 text-[17px] font-semibold text-foreground">
                          {group.title}
                        </p>
                      ) : null}
                      <ul className="space-y-3">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-[17px] leading-snug text-muted-foreground"
                          >
                            <Check className="h-5 w-5 shrink-0 text-muted-foreground/70" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
