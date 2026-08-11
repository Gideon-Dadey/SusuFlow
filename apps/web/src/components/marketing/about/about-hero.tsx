import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { MarketingContainer } from "../marketing-container";

export function AboutHero() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="pb-16 pt-14 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">About SusuFlow</p>
          <h1 className="ofx-display mt-4">
            Cashless susu. Built on Ghanaian trust.
          </h1>
          <p className="ofx-lead mx-auto mt-6 max-w-2xl">
            We digitize susu collections without breaking the community trust
            that makes savings work in Ghana. Verified MoMo deposits,
            transparent ledgers, and collectors who never handle cash.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
            <Link href="/register" className="ofx-btn ofx-btn-dark ofx-btn-lg">
              Get started for free
            </Link>
            <Link href="/how-it-works" className="ofx-link">
              See how it works
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
