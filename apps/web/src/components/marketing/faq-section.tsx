import Link from 'next/link';
import { FAQ_ITEMS } from '@/lib/marketing-data';
import { MarketingContainer } from './marketing-container';

export function FaqSection() {
  return (
    <section className="marketing-section border-t border-border bg-background">
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
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border sm:mt-12">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="cursor-pointer list-none text-base font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {q}
                  <span className="text-secondary transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{a}</p>
            </details>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
