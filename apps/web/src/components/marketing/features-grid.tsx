import { BarChart3, Bell, Lock, Plus, RefreshCw, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FEATURES } from '@/lib/marketing-data';
import { cn } from '@/lib/utils';
import { MarketingContainer } from './marketing-container';
import { SectionHeader } from './section-header';

const FEATURE_ITEMS: { icon: LucideIcon; iconBg: string }[] = [
  { icon: Lock, iconBg: 'bg-[#eab308]' },
  { icon: RefreshCw, iconBg: 'bg-[#22c55e]' },
  { icon: Users, iconBg: 'bg-[#14b8a6]' },
  { icon: Plus, iconBg: 'bg-[#3b82f6]' },
  { icon: BarChart3, iconBg: 'bg-[#ec4899]' },
  { icon: Bell, iconBg: 'bg-[#a855f7]' },
];

export function FeaturesGrid() {
  return (
    <section className="marketing-section bg-background">
      <MarketingContainer>
        <SectionHeader
          title="Built for trust, designed for Ghana"
          description="Everything susu companies need to go cashless — without losing the human relationships that make susu work."
        />
        <div className="marketing-section-grid sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const { icon: Icon, iconBg } = FEATURE_ITEMS[i]!;
            return (
              <div
                key={feature.title}
                className="feature-showcase-card flex flex-col items-center rounded-2xl bg-[#f8f9fa] px-6 py-10 text-center sm:px-8 sm:py-11 dark:bg-card"
              >
                <div
                  className={cn(
                    'mb-5 flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm',
                    iconBg,
                  )}
                >
                  <Icon className="size-7" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-heading">{feature.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
