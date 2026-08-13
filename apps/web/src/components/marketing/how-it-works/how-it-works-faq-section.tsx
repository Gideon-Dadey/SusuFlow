import { Plus } from "@/components/icons/phosphor";
import { FAQ_ITEMS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function HowItWorksFaqSection() {
  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">FAQ</p>
          <h2 className="ofx-h2 mt-4">Questions, answered.</h2>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-4 lg:mt-12">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="ofx-card group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 sm:p-7 [&::-webkit-details-marker]:hidden">
                <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  {q}
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center bg-[var(--ofx-cream)] transition-transform duration-200 group-open:rotate-45">
                  <Plus className="h-4 w-4 text-foreground" aria-hidden />
                </span>
              </summary>
              <p className="ofx-body -mt-1 px-6 pb-6 sm:px-7 sm:pb-7">{a}</p>
            </details>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
