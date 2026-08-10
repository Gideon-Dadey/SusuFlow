"use client";

import { useState } from "react";
import { RESOURCE_ARTICLES } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

const TILE_COLORS = [
  "var(--ofx-sage)",
  "var(--ofx-sand)",
  "var(--ofx-sky)",
  "var(--ofx-lilac)",
] as const;

const CATEGORIES = [
  "All",
  ...Array.from(new Set(RESOURCE_ARTICLES.map((a) => a.category))),
] as const;

export function OfxResourcesExplorer() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const [featured, ...rest] = RESOURCE_ARTICLES;
  const gridArticles =
    activeCategory === "All"
      ? rest
      : rest.filter((article) => article.category === activeCategory);

  return (
    <>
      <div
        className="flex flex-wrap gap-2.5"
        role="group"
        aria-label="Filter articles by category"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={category === activeCategory}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "pill rounded-full border px-5 py-2.5 text-[15px] font-medium transition-colors",
              category === activeCategory
                ? "border-[var(--ofx-ink)] bg-[var(--ofx-ink)] text-white"
                : "border-border bg-white text-foreground hover:bg-[var(--ofx-cream-deep)]",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <article className="ofx-card mt-10 grid overflow-hidden lg:grid-cols-2">
        <div
          className="flex min-h-[220px] items-end p-8 sm:min-h-[280px]"
          style={{ backgroundColor: "var(--ofx-sage)" }}
        >
          <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-foreground">
            {featured.category}
          </span>
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <p className="text-xs font-medium text-muted-foreground">
            {featured.date} · {featured.readTime}
          </p>
          <h2 className="ofx-h3 mt-4">{featured.title}</h2>
          <p className="ofx-body mt-4">{featured.excerpt}</p>
          <p className="mt-6 text-sm font-medium text-muted-foreground">
            Coming soon
          </p>
        </div>
      </article>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gridArticles.map((article, i) => (
          <article key={article.slug} className="ofx-card flex flex-col">
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
              <p className="mt-auto pt-5 text-sm font-medium text-muted-foreground">
                Coming soon
              </p>
            </div>
          </article>
        ))}
      </div>

      {gridArticles.length === 0 && (
        <p className="ofx-body mt-10 text-center">
          More {activeCategory.toLowerCase()} stories are on the way.
        </p>
      )}
    </>
  );
}
