"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { PRICING_FAQ } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingFaqSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <p className="text-sm font-medium text-muted-foreground">FAQs</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Common questions about plans and billing
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Still unsure?{" "}
            <Link
              href="/contact"
              className="font-medium text-secondary hover:underline"
            >
              Contact our team
            </Link>
            .
          </p>
        </div>

        <div className="mt-10 flex max-w-3xl flex-col gap-3 sm:mt-12 lg:mx-auto">
          {PRICING_FAQ.map(({ q, a }) => (
            <details key={q} className="faq-item group">
              <summary className="faq-item-summary">
                <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground sm:size-9">
                  <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="h-5 w-5"
                    aria-hidden
                  />
                </span>
                <span className="min-w-0 flex-1 text-left text-[0.9375rem] font-normal leading-snug text-foreground sm:text-base">
                  {q}
                </span>
                <span className="flex size-6 shrink-0 items-center justify-center text-foreground">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="h-3 w-3 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </span>
              </summary>
              <div className="faq-item-answer">
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                  {a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
