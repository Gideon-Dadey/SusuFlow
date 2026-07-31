"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FAQ_ITEMS } from "@/lib/marketing-data";
import { MarketingContainer } from "./marketing-container";

export function FaqSection() {
  return (
    <section className="marketing-section bg-background">
      <MarketingContainer>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Everything you need to know about digital susu with Credo.
            Can&apos;t find your answer?{" "}
            <Link
              href="/contact"
              className="font-medium text-secondary hover:underline"
            >
              Contact us
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:mt-12">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="faq-item group">
              <summary className="faq-item-summary">
                <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground sm:size-9">
                  <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="h-5 w-5"
                    aria-hidden
                  />
                </span>
                <span className="min-w-0 flex-1 text-left text-base font-semibold leading-snug text-foreground sm:text-lg">
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
                <p className="text-base leading-relaxed text-muted-foreground">
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
