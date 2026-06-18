import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND_HERO_IMAGE } from '@/lib/brand-assets';
import { MarketingContainer } from './marketing-container';

export function MarketingHero() {
  return (
    <section className="marketing-nav-overlap marketing-hero-viewport relative flex flex-col overflow-hidden">
      <div className="marketing-hero-media">
        <div className="marketing-hero-image-frame">
          <Image
            src={BRAND_HERO_IMAGE}
            alt="Ghanaian susu members confirming a verified Mobile Money deposit on SusuFlow"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[42%_28%] sm:object-[58%_36%] lg:object-[76%_42%]"
          />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10 lg:from-black/65 lg:via-black/30 lg:to-transparent"
        aria-hidden
      />

      <MarketingContainer className="marketing-hero-inner relative z-10 flex flex-1 flex-col">
        <div className="marketing-hero-content grid flex-1 items-end sm:items-center lg:grid-cols-2 lg:gap-x-10 xl:gap-x-12 2xl:gap-x-16">
          <div className="animate-fade-in min-w-0 text-center lg:text-left">
            <h1 className="marketing-hero-title text-balance text-white lg:[text-shadow:0_2px_12px_rgba(0,0,0,0.45)]">
              Save with confidence.{' '}
              <span className="text-secondary">Every cedi verified.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-[0.9375rem] font-normal leading-relaxed text-white/85 sm:mt-5 sm:text-base lg:mx-0 lg:mt-6 lg:max-w-2xl 2xl:max-w-3xl">
              SusuFlow digitizes susu collection for Ghana — Mobile Money deposits, real-time
              ledgers, and collectors who never touch cash.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center lg:justify-start">
              <Link href="/contact?intent=demo">
                <Button
                  size="lg"
                  className="h-12 w-full px-5 text-sm font-medium shadow-[0_10px_28px_rgba(34,197,94,0.35)] sm:w-auto lg:h-[3.25rem] lg:rounded-full lg:px-6"
                >
                  Request a demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full border-white/40 bg-white/5 px-5 text-sm font-medium text-white hover:bg-white/10 sm:w-auto lg:h-[3.25rem] lg:rounded-full lg:px-6"
                >
                  Join your susu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
