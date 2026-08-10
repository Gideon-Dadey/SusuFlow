import { MarketingContainer } from "../marketing-container";

const PLACES = [
  "Accra",
  "Kumasi",
  "Takoradi",
  "Tamale",
  "Cape Coast",
  "Sunyani",
  "Koforidua",
  "Ho",
  "Techiman",
  "Wa",
];

export function OfxTickerSection() {
  const items = [...PLACES, ...PLACES];

  return (
    <section className="border-y border-border/70 bg-[var(--ofx-cream)] py-12 sm:py-16">
      <MarketingContainer>
        <h2 className="ofx-h2 text-center">
          Thousands of savers and growing. Join us.
        </h2>
      </MarketingContainer>
      <div className="mt-10 overflow-hidden" aria-hidden>
        <div className="ofx-marquee-track gap-4 pr-4">
          {items.map((place, i) => (
            <span key={`${place}-${i}`} className="ofx-chip">
              <span className="size-1.5 rounded-full bg-[var(--ofx-flame)]" />
              Susu companies in {place}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
