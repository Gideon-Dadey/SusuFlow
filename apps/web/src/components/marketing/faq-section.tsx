'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FAQ_ITEMS } from '@/lib/marketing-data';
import { MarketingContainer } from './marketing-container';

export function FaqSection() {
  return (
    <section className="marketing-section bg-background">
      <MarketingContainer>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Common questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Everything you need to know about digital susu with SusuFlow. Can&apos;t find your
            answer?{' '}
            <Link href="/contact" className="font-medium text-secondary hover:underline">
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
                  <FontAwesomeIcon icon={faCircleQuestion} className="h-5 w-5" aria-hidden />
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
