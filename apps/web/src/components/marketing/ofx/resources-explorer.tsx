"use client";

import { useState } from "react";
import { ResourceArticleCard } from "@/components/marketing/resource-article-card";
import { RESOURCE_ARTICLES } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";

const ARTICLE_IMAGES = [
  "/marketing/why-susuflow/cashless.png",
  "/marketing/why-susuflow/market-scale.png",
  "/marketing/why-susuflow/use-cases.png",
  "/marketing/why-susuflow/fraud.png",
  "/marketing/why-susuflow/accounting.png",
  "/marketing/why-susuflow/verification.png",
];

const CATEGORIES = [
  "All",
  ...Array.from(new Set(RESOURCE_ARTICLES.map((a) => a.category))),
] as const;

export function OfxResourcesExplorer() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const articles =
    activeCategory === "All"
      ? RESOURCE_ARTICLES
      : RESOURCE_ARTICLES.filter(
          (article) => article.category === activeCategory,
        );

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
              "border px-5 py-2.5 text-[15px] font-medium transition-colors",
              category === activeCategory
                ? "border-[var(--ofx-ink)] bg-[var(--ofx-ink)] text-white"
                : "border-slate-200 bg-white text-[#1a1a1a] hover:bg-[#f7f7f7] dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/5",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <ResourceArticleCard
            key={article.slug}
            article={article}
            image={ARTICLE_IMAGES[i % ARTICLE_IMAGES.length]}
            imageAlt=""
          />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="omnih-body mt-10 text-center">
          More {activeCategory.toLowerCase()} stories are on the way.
        </p>
      )}
    </>
  );
}
