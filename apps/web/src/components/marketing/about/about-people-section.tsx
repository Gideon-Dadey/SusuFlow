import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ABOUT_PEOPLE } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

const PEOPLE_TILE_COLORS = [
  "var(--ofx-sand)",
  "var(--ofx-sky)",
  "var(--ofx-lilac)",
];

export function AboutPeopleSection() {
  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="max-w-2xl">
          <p className="ofx-eyebrow">People behind the platform</p>
          <h2 className="ofx-h2 mt-4">Real people. At every step.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-14">
          {ABOUT_PEOPLE.map(({ title, description, href, cta }, i) => (
            <article
              key={title}
              className="flex flex-col rounded-[1.75rem] p-7 sm:p-9"
              style={{ backgroundColor: PEOPLE_TILE_COLORS[i % 3] }}
            >
              <h3 className="ofx-h3">{title}</h3>
              <p className="ofx-body mt-3 flex-1">{description}</p>
              <Link href={href} className="ofx-link mt-7 text-sm">
                {cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
