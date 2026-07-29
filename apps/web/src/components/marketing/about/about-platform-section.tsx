import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ABOUT_VALUES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function AboutPlatformSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Everything susu companies need, in a single platform
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:mx-auto">
            Designed to help susu operators manage collections, commissions, and
            payouts across branches. Verified MoMo deposits, live balances, and
            exportable reports make choosing Credo straightforward.
          </p>
          <Link
            href="/how-it-works"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary transition-colors hover:text-secondary/80 lg:justify-center"
          >
            Read more
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {ABOUT_VALUES.map(({ title, body }) => (
            <article
              key={title}
              className="rounded-none border border-border/80 bg-white p-6 dark:border-border dark:bg-card"
            >
              <h3 className="text-base font-bold text-foreground sm:text-lg">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {body}
              </p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
