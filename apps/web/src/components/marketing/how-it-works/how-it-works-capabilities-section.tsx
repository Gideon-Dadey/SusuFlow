import {
  Activity,
  FileCheck,
  Send,
  ShieldCheck,
  Smartphone,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MOMO_PAY_CAPABILITIES } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';
import { cn } from '@/lib/utils';

const CAPABILITY_ICONS: LucideIcon[] = [
  Smartphone,
  ShieldCheck,
  Users,
  Activity,
  Send,
  FileCheck,
];

export function HowItWorksCapabilitiesSection() {
  return (
    <section className="border-t border-border bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-1 min-w-0 text-left lg:order-2">
            <p className="text-sm font-medium text-muted-foreground">Platform capabilities</p>
            <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
              Everything your company needs to go cashless
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              The same tools you see on our homepage power your daily operations. MoMo deposits,
              verified settlements, collector prompts, and audit ready records in one place.
            </p>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              Start with a free trial, onboard your first collectors, and move your next savings
              cycle onto a ledger your staff and members can trust.
            </p>
          </div>

          <div className="order-2 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:order-1">
            {MOMO_PAY_CAPABILITIES.map(({ label }, i) => {
              const Icon = CAPABILITY_ICONS[i]!;
              return (
                <div
                  key={label}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-center rounded-2xl bg-white px-3 py-5 text-center',
                    'transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]',
                    'dark:bg-card dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
                  )}
                >
                  <Icon
                    className="size-9 shrink-0 text-foreground sm:size-10"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="mt-4 text-xs font-semibold leading-snug text-foreground sm:text-sm">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
