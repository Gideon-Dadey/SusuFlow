import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS_DIGITAL_COLLECTOR } from '@/lib/brand-assets';
import { MarketingContainer } from '../marketing-container';

export function AboutStorySection() {
  return (
    <section className="border-b border-border bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mb-10 text-left lg:mb-12 lg:text-center">
          <p className="text-sm font-medium text-muted-foreground">Client stories</p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Susu companies love clarity. Here&apos;s why.
          </h2>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-border/80 bg-white dark:border-border dark:bg-card lg:grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[20rem]">
            <Image
              src={HOW_IT_WORKS_DIGITAL_COLLECTOR}
              alt="SusuFlow collector helping a Ghanaian saver pay via Mobile Money"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            <p className="text-sm font-medium text-muted-foreground">Traditional susu, modern ledger</p>
            <h3 className="mt-3 text-balance text-xl font-bold leading-snug text-foreground sm:text-2xl">
              See how verified MoMo deposits reduce disputes and speed up reconciliation.
            </h3>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              When collectors stop carrying cash and every deposit is gateway confirmed, management
              teams spend less time chasing screenshots and more time growing membership.
            </p>
            <Link
              href="/how-it-works"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary transition-colors hover:text-secondary/80"
            >
              Read how it works
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
