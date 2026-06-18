import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MarketingContainer } from './marketing-container';

export function CtaSection() {
  return (
    <section className="border-t border-border bg-brand-dark py-16 dark:bg-background sm:py-20 xl:py-24">
      <MarketingContainer>
        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-brand-dark via-brand-dark to-secondary/20 p-8 dark:border-secondary/30 dark:from-card dark:via-card dark:to-secondary/10 sm:p-12 xl:p-14 2xl:p-16">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 2xl:gap-20">
            <div className="max-w-2xl 2xl:max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-white dark:text-heading sm:text-3xl">
                Ready to run a cashless susu?
              </h2>
              <p className="mt-4 text-sm text-slate-300 dark:text-muted-foreground sm:text-base">
                Join savers and susu companies already moving to verified Mobile Money deposits.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link href="/contact?intent=demo">
                <Button size="lg" className="w-full rounded-lg sm:w-auto">
                  Request a demo
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-lg border-white/30 bg-transparent text-white hover:bg-white/10 dark:border-secondary/40 dark:hover:border-secondary dark:hover:bg-secondary/10 sm:w-auto"
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
