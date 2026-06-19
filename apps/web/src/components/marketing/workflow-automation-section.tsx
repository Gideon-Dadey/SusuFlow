import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { BRAND_WORKFLOW_AUTOMATION } from '@/lib/brand-assets';
import { MarketingContainer } from './marketing-container';
import { cn } from '@/lib/utils';

const WORKFLOW_STEPS = [
  { label: 'MoMo deposit initiated', initials: 'AK' },
  { label: 'Gateway receipt verified', initials: 'AK' },
  { label: 'Payout approved', initials: 'FA' },
] as const;

function ConfirmedCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.14)] backdrop-blur-sm',
        'dark:border-border dark:bg-card',
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-6" strokeWidth={2.5} aria-hidden />
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-foreground">Deposit confirmed</p>
    </div>
  );
}

function TimelineCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/80 bg-white/95 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.14)] backdrop-blur-sm sm:p-6',
        'dark:border-border dark:bg-card',
        className,
      )}
    >
      <ol className="relative space-y-5">
        {WORKFLOW_STEPS.map((step, index) => (
          <li key={step.label} className="relative flex items-start gap-3 pl-1">
            {index < WORKFLOW_STEPS.length - 1 ? (
              <span
                className="absolute left-[1.125rem] top-8 h-[calc(100%+0.25rem)] w-px bg-border"
                aria-hidden
              />
            ) : null}
            <span
              className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[0.65rem] font-bold text-foreground"
              aria-hidden
            >
              {step.initials}
            </span>
            <span className="pt-1.5 text-sm font-medium leading-snug text-foreground">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function WorkflowAutomationSection() {
  return (
    <section className="border-t border-border bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-1 min-w-0 text-left lg:order-1">
            <p className="text-sm font-medium text-muted-foreground">Streamline workflows</p>
            <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.35rem]">
              Automate your deposit &amp; payout approvals
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
              SusuFlow helps streamline collections with tailored approval workflows. Set clear rules
              for collector actions, MoMo deposit verification, payout sign-offs, and staff access,
              so every cedi moves with accountability.
            </p>
            <Link
              href="/how-it-works"
              className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-muted-foreground transition-colors hover:text-foreground lg:mt-8"
            >
              Deposit automation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative order-2 mx-auto w-full max-w-xl lg:order-2 lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[5/4]">
              <Image
                src={BRAND_WORKFLOW_AUTOMATION}
                alt="SusuFlow staff reviewing deposit approvals in a modern office"
                fill
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover object-center"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-black/5"
                aria-hidden
              />
            </div>

            <ConfirmedCard className="absolute -left-2 bottom-8 w-[8.5rem] sm:-left-4 sm:bottom-10 sm:w-[9.5rem]" />
            <TimelineCard className="absolute -right-2 top-6 w-[11.5rem] sm:-right-4 sm:top-8 sm:w-[13rem]" />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
