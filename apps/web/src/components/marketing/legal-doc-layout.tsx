import Link from "next/link";
import { MarketingContainer } from "./marketing-container";
import { MicroLabel } from "./micro-label";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

export function LegalDocLayout({
  eyebrow = "Legal",
  title,
  updated,
  sections,
  related,
}: {
  eyebrow?: string;
  title: string;
  updated: string;
  sections: LegalSection[];
  related?: { href: string; label: string }[];
}) {
  return (
    <div className="omnih-atmosphere bg-white dark:bg-twitter-dark">
      <MarketingContainer className="py-20 md:py-28">
        <div className="max-w-3xl">
          <MicroLabel>{eyebrow}</MicroLabel>
          <h1 className="omnih-h2 mt-4">{title}</h1>
          <p className="omnih-body mt-4">{updated}</p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
          <nav className="hidden lg:block" aria-label="On this page">
            <div className="sticky top-28">
              <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400">
                On this page
              </p>
              <ul className="mt-4 space-y-2.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-slate-600 transition-colors hover:text-[#1a1a1a] dark:text-slate-400 dark:hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <article className="max-w-2xl space-y-10 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28"
              >
                <h2 className="text-xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white md:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">{section.content}</div>
              </section>
            ))}
          </article>
        </div>

        {related?.length ? (
          <div className="mt-16 border-t border-slate-200 pt-8 dark:border-white/10">
            <p className="text-[13px] text-slate-600 dark:text-slate-400">
              Related
            </p>
            <div className="mt-3 flex flex-wrap gap-5 text-sm font-medium">
              {related.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[#1a1a1a] underline-offset-4 hover:underline dark:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </MarketingContainer>
    </div>
  );
}
