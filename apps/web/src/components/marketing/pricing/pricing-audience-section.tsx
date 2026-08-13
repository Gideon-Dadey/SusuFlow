import { PRICING_AUDIENCES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

const TILE_COLORS = [
  "var(--ofx-sage)",
  "var(--ofx-sand)",
  "var(--ofx-sky)",
] as const;

export function PricingAudienceSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <h2 className="ofx-h2 mx-auto max-w-2xl text-center">
          Which plan fits you?
        </h2>
        <p className="ofx-lead mx-auto mt-5 max-w-2xl text-center">
          Wherever you are on the road from notebooks to fully cashless,
          there&apos;s a plan built for that stage.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PRICING_AUDIENCES.map((audience, i) => (
            <div
              key={audience.plan}
              className="flex flex-col p-8"
              style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }}
            >
              <p className="ofx-eyebrow text-foreground/70">{audience.plan}</p>
              <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-foreground">
                {audience.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
