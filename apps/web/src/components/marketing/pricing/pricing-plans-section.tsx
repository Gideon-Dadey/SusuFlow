import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PRICING_PLANS } from "@/lib/marketing-data";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";
import { cn } from "@/lib/utils";

export function PricingPlansSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="text-center">Pricing</SectionEyebrow>
          <h1 className="afrusan-hero-title text-balance !text-4xl sm:!text-5xl lg:!text-[3.5rem]">
            Plans to suit your susu company, no matter the size.
          </h1>
          <p className="afrusan-body mx-auto mt-5 max-w-2xl text-balance">
            Start with a free trial, scale with verified MoMo collections, and
            grow into multi-branch operations. No per-deposit fees — you pay for
            the platform, not every transaction.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "afrusan-card relative flex flex-col p-6 text-left sm:p-8",
                plan.popular &&
                  "ring-2 ring-[#c6e5df] ring-offset-2 ring-offset-background",
              )}
            >
              {plan.popular ? (
                <span className="mb-4 inline-flex w-fit rounded-full bg-[#c6e5df]/50 px-3 py-1 text-xs font-medium text-foreground">
                  Most popular
                </span>
              ) : (
                <span className="mb-4 block h-6" aria-hidden />
              )}

              <h2 className="font-geist text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                {plan.name}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {plan.audience}
              </p>

              <div className="mt-8 pb-8">
                <p
                  className={cn(
                    "font-geist font-medium tracking-tight text-foreground tabular-nums",
                    plan.name === "Custom"
                      ? "text-3xl sm:text-[2rem]"
                      : "text-4xl sm:text-5xl",
                  )}
                >
                  {plan.price}
                </p>
                {plan.period ? (
                  <p className="mt-2 text-base text-muted-foreground">
                    {plan.period}
                  </p>
                ) : null}
              </div>

              {plan.name === "Custom" ? (
                <div className="mt-8 flex flex-col gap-3">
                  <input
                    type="email"
                    placeholder="What's your work email?"
                    className="min-h-[3rem] w-full rounded-xl border border-border bg-background px-4 py-2.5 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full font-medium"
                  >
                    {plan.cta}
                  </Button>
                </div>
              ) : (
                <Link href={plan.ctaHref} className="mt-8 block">
                  <Button
                    size="lg"
                    className="h-12 w-full rounded-full font-medium"
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </Link>
              )}

              <div className="mt-8 flex-1">
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {plan.featureLabel}
                </p>
                <ul className="mt-5 space-y-4">
                  {plan.featureGroups.map((group) => (
                    <li key={group.title ?? "features"}>
                      {group.title ? (
                        <p className="mb-3 text-base font-medium text-foreground">
                          {group.title}
                        </p>
                      ) : null}
                      <ul className="space-y-3">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-base leading-snug text-muted-foreground"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
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
