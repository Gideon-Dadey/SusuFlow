import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/marketing-container";
import { OfxResourcesExplorer } from "@/components/marketing/ofx/resources-explorer";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `${APP_NAME} | Resources`,
  description:
    "Insights, news and stories for susu operators — from cashless collections and verified MoMo deposits to approvals, ledgers and growing multi-branch teams.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="bg-[var(--ofx-cream)]">
        <MarketingContainer className="pb-16 pt-14 sm:pt-16 lg:pb-20 lg:pt-20">
          <div className="max-w-2xl">
            <p className="ofx-eyebrow">Resources</p>
            <h1 className="ofx-display mt-4">Insights, news and stories</h1>
            <p className="ofx-lead mt-6">
              Practical guides and fresh thinking for susu operators building
              cashless, dispute-free operations.
            </p>
          </div>
        </MarketingContainer>
      </section>

      <section className="bg-[var(--ofx-paper)]">
        <MarketingContainer className="ofx-section">
          <OfxResourcesExplorer />
        </MarketingContainer>
      </section>

      <section className="bg-[var(--ofx-cream)]">
        <MarketingContainer className="ofx-section">
          <div
            className="grid items-center gap-8 rounded-[2rem] p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:gap-14 lg:p-16"
            style={{ backgroundColor: "var(--ofx-sand)" }}
          >
            <div className="max-w-xl">
              <h2 className="ofx-h2">Get operator insights first</h2>
              <p className="ofx-body mt-4">
                See how verified MoMo collections, live ledgers and approval
                workflows come together in practice. Our team will walk you
                through the platform with your own operation in mind.
              </p>
            </div>
            <Link
              href="/contact?intent=demo"
              className="ofx-btn ofx-btn-dark ofx-btn-lg"
            >
              Book a demo
            </Link>
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}
