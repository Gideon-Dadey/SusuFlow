import { Check } from "lucide-react";
import { ABOUT_COMPLIANCE_POINTS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function AboutComplianceSection() {
  return (
    <section className="bg-white dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Secure, auditable, and built for verified collections
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:mx-auto">
            Credo is designed around gateway confirmed Mobile Money deposits and
            transparent ledger records. Your team sees the same numbers your
            savers expect.
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:mt-12 sm:grid-cols-2">
          {ABOUT_COMPLIANCE_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-none border border-border/80 bg-white p-5 dark:border-border dark:bg-card"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white">
                <Check className="size-4" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-foreground sm:text-base">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </section>
  );
}
