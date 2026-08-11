import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { MarketingContainer } from "../marketing-container";

export function HowItWorksHero() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="pb-16 pt-14 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">How it works</p>
          <h1 className="ofx-display mt-4">
            From notebooks to verified MoMo. In four steps.
          </h1>
          <p className="ofx-lead mx-auto mt-6 max-w-2xl">
            Keep your collectors, keep your community trust. SusuFlow moves the
            money onto a verified digital ledger — so every cedi is confirmed,
            traceable, and dispute-proof.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
            <Link href="/register" className="ofx-btn ofx-btn-dark ofx-btn-lg">
              Get started for free
            </Link>
            <Link href="/pricing" className="ofx-link">
              View pricing
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
