import { Send, ShieldCheck, Smartphone, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

const STEP_ICONS: LucideIcon[] = [Users, Smartphone, ShieldCheck, Send];

export function HowItWorksStepsSection() {
  return (
    <section className="bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-left">
          <p className="text-sm font-medium text-muted-foreground">The digital path</p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2rem]">
            Four steps from signup to verified savings
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
            Whether you run a formal susu company or a growing collector network, the flow is the
            same. Simple for members. Accountable for management.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map(({ step, title, description }, i) => {
            const Icon = STEP_ICONS[i]!;
            return (
              <article
                key={step}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-8 dark:border-border dark:shadow-none"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#f3f4f6] dark:bg-muted">
                    <Icon className="size-7 text-foreground" strokeWidth={1.5} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-secondary">{step}</span>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
