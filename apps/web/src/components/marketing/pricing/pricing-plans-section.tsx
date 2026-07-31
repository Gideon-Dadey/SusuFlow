import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
              className="flex flex-col rounded-none border border-border/80 bg-white p-6 text-center shadow-sm dark:border-border dark:bg-card dark:shadow-none sm:p-8"
            >
              {plan.popular ? (
                <p className="mb-4">
                  <span className="inline-flex rounded-full border border-[#e87722] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#e87722]">
                    Most popular
                  </span>
                </p>
              ) : (
                <span className="mb-4 block h-[1.625rem]" aria-hidden />
              )}

              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">
                {plan.name}
              </h2>
              <p className="mx-auto mt-3 max-w-[16rem] text-sm leading-relaxed text-muted-foreground sm:max-w-[18rem]">
                {plan.audience}
              </p>

              <div className="mt-8">
                <p className="text-4xl font-bold tracking-tight text-foreground tabular-nums sm:text-[2.75rem]">
                  {plan.price}
                </p>
                {plan.period ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.period}
                  </p>
                ) : null}
              </div>

              <Link href={plan.ctaHref} className="mt-8 block">
                <Button
                  size="lg"
                  className={cn(
                    "h-12 w-full rounded-none text-[15px] font-bold",
                    plan.name === "Enterprise"
                      ? "bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]/90 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      : "shadow-[0_4px_14px_rgba(34,197,94,0.25)]",
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>

              <div className="mt-8 flex-1 border-t border-border/70 pt-8 text-left">
                <p className="text-sm font-bold text-foreground">
                  {plan.featureLabel}
                </p>
                <ul className="mt-4 space-y-5">
                  {plan.featureGroups.map((group) => (
                    <li key={group.title ?? "features"}>
                      {group.title ? (
                        <p className="text-sm font-semibold text-foreground">
                          {group.title}
                        </p>
                      ) : null}
                      <ul
                        className={cn(
                          "list-disc space-y-1.5 pl-4",
                          group.title && "mt-2",
                        )}
                      >
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="text-sm leading-snug text-muted-foreground"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-border/70 pt-6">
                <Link
                  href="#compare"
                  className="text-sm font-semibold text-foreground underline-offset-4 transition-colors hover:text-secondary hover:underline"
                >
                  Compare all features
                </Link>
              </div>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
