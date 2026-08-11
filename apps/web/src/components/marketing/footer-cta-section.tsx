import Link from "next/link";
import { ArrowRight } from "@/components/icons/phosphor";
import { MarketingContainer } from "./marketing-container";

export function FooterCtaSection() {
  return (
    <section className="ofx-dark-section">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">
            Start improving your collections right now
          </p>
          <h2 className="ofx-h2 mt-4">
            Get started for free today.
            <br />
            <span className="text-[color:var(--muted-foreground)]">
              The trust lasts forever.
            </span>
          </h2>
          <p className="ofx-lead mx-auto mt-5 max-w-xl">
            The one thing we can&apos;t automate? You, clicking the button
            below. You have nothing to lose — and disputed notebooks to leave
            behind.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="ofx-btn ofx-btn-cream ofx-btn-lg">
              Get started
            </Link>
            <Link
              href="/contact?intent=demo"
              className="ofx-link text-[color:var(--foreground)]"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-5 sm:grid-cols-2">
          <div className="flex flex-col justify-between rounded-3xl border border-[color:var(--border)] p-7">
            <div>
              <h3 className="ofx-h3">See our platform in action</h3>
              <p className="ofx-body mt-2.5">
                Book a personalised demo with our team. We&apos;ll walk you
                through how SusuFlow supports your collection cycles.
              </p>
            </div>
            <Link
              href="/contact?intent=demo"
              className="ofx-link mt-6 text-sm text-[color:var(--foreground)]"
            >
              Book a demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-[color:var(--border)] p-7">
            <div>
              <h3 className="ofx-h3">Real people. Real help.</h3>
              <p className="ofx-body mt-2.5">
                Have a question? We&apos;re on hand to support your staff and
                collectors. Call or email us anytime.
              </p>
            </div>
            <Link
              href="/contact"
              className="ofx-link mt-6 text-sm text-[color:var(--foreground)]"
            >
              Contact us
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
