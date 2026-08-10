import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RESOURCE_ARTICLES } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

const TILE_COLORS = [
  "var(--ofx-sage)",
  "var(--ofx-sand)",
  "var(--ofx-sky)",
] as const;

export function OfxBlogTeaserSection() {
  const articles = RESOURCE_ARTICLES.slice(0, 3);

  return (
    <section className="bg-[var(--ofx-cream)]">
      <MarketingContainer className="ofx-section">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="ofx-h2 max-w-xl">The latest from SusuFlow</h2>
          <Link href="/resources" className="ofx-link text-sm">
            See all articles
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {articles.map((article, i) => (
            <Link
              key={article.slug}
              href="/resources"
              className="ofx-card group flex flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              <div
                className="flex h-40 items-end p-6"
                style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length] }}
              >
                <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-foreground">
                  {article.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="text-xs font-medium text-muted-foreground">
                  {article.date} · {article.readTime}
                </p>
                <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-foreground">
                  {article.title}
                </h3>
                <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {article.excerpt}
                </p>
                <span className="ofx-link mt-auto pt-5 text-sm">
                  Read more
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
