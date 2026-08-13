import { BadgeCheck } from "@/components/icons/phosphor";
import { ABOUT_COMPLIANCE_POINTS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function AboutComplianceSection() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <div className="ofx-dark-section p-8 sm:p-12 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="ofx-eyebrow">Trust &amp; compliance</p>
              <h2 className="ofx-h2 mt-4">Secure, auditable, verified.</h2>
              <p className="ofx-lead mt-5 max-w-md">
                {" "}
                SusuFlow is designed around gateway confirmed Mobile Money
                deposits and transparent ledger records. Your team sees the same
                numbers your savers expect.{" "}
              </p>
            </div>
            <ul className="space-y-4 lg:pt-2">
              {ABOUT_COMPLIANCE_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-4 bg-white/[0.06] p-5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center bg-[var(--ofx-sage)]">
                    <BadgeCheck
                      className="h-4 w-4 text-[var(--ofx-ink)]"
                      aria-hidden
                    />
                  </span>
                  <span className="text-base leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
