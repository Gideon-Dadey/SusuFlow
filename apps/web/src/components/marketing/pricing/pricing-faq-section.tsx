import { Plus } from "@/components/icons/phosphor";
import { PRICING_FAQ } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function PricingFaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <h2 className="ofx-h2 mx-auto max-w-2xl text-center">
          Frequently asked questions
        </h2>

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {PRICING_FAQ.map((item) => (
            <details
              key={item.q}
              className="group border border-border/70 bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-medium tracking-tight text-foreground [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="ofx-body px-6 pb-6">{item.a}</p>
            </details>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
