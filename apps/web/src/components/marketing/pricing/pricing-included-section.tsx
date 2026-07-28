import {
  Activity,
  FileCheck,
  Send,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MOMO_PAY_CAPABILITIES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";
import { cn } from "@/lib/utils";

const CAPABILITY_ICONS: LucideIcon[] = [
  Smartphone,
  ShieldCheck,
  Users,
  Activity,
  Send,
  FileCheck,
];

export function PricingIncludedSection() {
  return (
    <section className="border-t border-border bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl text-left">
          <p className="text-sm font-medium text-muted-foreground">
            Included on every plan
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Core platform capabilities across all tiers
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground">
            Every plan includes the same verified MoMo foundation. Higher tiers
            add scale, roles, and support for growing susu companies.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-12">
          {MOMO_PAY_CAPABILITIES.map(({ label }, i) => {
            const Icon = CAPABILITY_ICONS[i]!;
            return (
              <div
                key={label}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-none bg-white px-3 py-5 text-center",
                  "transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
                  "dark:bg-card",
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
      </MarketingContainer>
    </section>
  );
}
