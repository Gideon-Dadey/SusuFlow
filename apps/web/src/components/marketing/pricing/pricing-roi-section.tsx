import { BadgeCheck } from "lucide-react";
import { PRICING_ROI } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingRoiSection() {
  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="ofx-dark-section rounded-[2rem] px-6 py-12 sm:px-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="ofx-eyebrow">Manual vs digital</p>
            <h2 className="ofx-h2 mt-4">
              What you leave behind. What you gain.
            </h2>
          </div>

          <div className="mx-auto mt-12 max-w-4xl">
            <div className="hidden grid-cols-2 gap-6 pb-4 sm:grid">
              <p className="ofx-eyebrow">The manual way</p>
              <p className="ofx-eyebrow text-[color:var(--foreground)]">
                With SusuFlow
              </p>
            </div>
            <div className="divide-y divide-[color:var(--border)] border-t border-[color:var(--border)]">
              {PRICING_ROI.map((row) => (
                <div
                  key={row.digital}
                  className="grid gap-2 py-5 sm:grid-cols-2 sm:gap-6"
                >
                  <p className="text-[15px] leading-snug text-muted-foreground line-through">
                    {row.manual}
                  </p>
                  <p className="flex items-start gap-2.5 text-[15px] font-medium leading-snug text-foreground">
                    <BadgeCheck
                      className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[var(--ofx-flame)]"
                      aria-hidden
                    />
                    {row.digital}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
