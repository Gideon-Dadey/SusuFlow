import { ABOUT_OPERATING_DETAILS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function AboutDetailsSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">Operating details</p>
          <h2 className="ofx-h2 mt-4">Where and how we operate.</h2>
          <p className="ofx-lead mx-auto mt-5 max-w-2xl">
            SusuFlow serves susu companies across Ghana with Mobile Money
            integrations aligned to local payment practices.
          </p>
        </div>

        {ABOUT_OPERATING_DETAILS.map((row) => (
          <div
            key={row.region}
            className="ofx-card mx-auto mt-10 max-w-4xl p-7 sm:p-9 lg:mt-12"
          >
            <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="ofx-eyebrow">Region</dt>
                <dd className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {row.region}
                </dd>
              </div>
              <div>
                <dt className="ofx-eyebrow">Entity</dt>
                <dd className="mt-2 text-base font-semibold tracking-tight text-foreground">
                  {row.entity}
                </dd>
              </div>
              <div>
                <dt className="ofx-eyebrow">Payment partners</dt>
                <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {row.partners}
                </dd>
              </div>
              <div>
                <dt className="ofx-eyebrow">Standards</dt>
                <dd className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {row.standards}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </MarketingContainer>
    </section>
  );
}
