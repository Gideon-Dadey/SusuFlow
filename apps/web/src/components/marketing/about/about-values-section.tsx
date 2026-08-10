import { ABOUT_VALUES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function AboutValuesSection() {
  return (
    <section id="mission" className="scroll-mt-24 bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">What we stand for</p>
          <h2 className="ofx-h2 mt-4">Four values. Every decision.</h2>
          <p className="ofx-lead mx-auto mt-5 max-w-2xl">
            SusuFlow builds on Ghana&apos;s susu heritage — digital tools that
            strengthen the relationships savers already rely on.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {ABOUT_VALUES.map(({ title, body }) => (
            <article key={title} className="ofx-card p-7">
              <span className="block size-2.5 rounded-full bg-[var(--ofx-flame)]" />
              <h3 className="ofx-h3 mt-6">{title}</h3>
              <p className="ofx-body mt-3">{body}</p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
