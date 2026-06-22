import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingContainer } from '../marketing-container';

export function HowItWorksCtaSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="w-full rounded-3xl bg-[#1a1a1a] px-6 py-12 text-left sm:px-8 sm:py-14 lg:px-10 lg:py-16 xl:px-12">
          <p className="text-sm font-medium text-white/70">Ready to modernize?</p>
          <h2 className="mt-4 max-w-2xl text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
            Bring your susu company online without losing the trust you built offline.
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
            Book a demo with our team. We will walk you through tenant setup, collector onboarding,
            and your first verified MoMo collection cycle.
          </p>
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/contact?intent=demo" className="sm:w-auto">
              <Button
                size="lg"
                className="h-12 w-full rounded-lg text-base font-semibold shadow-[0_6px_20px_rgba(34,197,94,0.35)] sm:min-w-[11rem]"
              >
                Request a demo
              </Button>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg border border-white/35 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:min-w-[11rem]"
            >
              View pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
