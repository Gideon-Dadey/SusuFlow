import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { SUPPORT_EMAIL } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function ContactHero() {
  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="pb-16 pt-14 sm:pt-16 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">Contact</p>
          <h1 className="ofx-display mt-4">Real people. Real help.</h1>
          <p className="ofx-lead mx-auto mt-6 max-w-2xl">
            Questions about the platform, pricing, or onboarding your susu
            company? Share a few details and a member of our team will be in
            touch within one business day.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
            <Link
              href="#contact-form"
              className="ofx-btn ofx-btn-dark ofx-btn-lg"
            >
              Send a message
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="ofx-link">
              Email us instead
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
