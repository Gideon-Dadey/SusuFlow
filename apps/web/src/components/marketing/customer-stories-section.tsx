"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "@/components/icons/phosphor";
import { FEATURED_CUSTOMER_STORIES } from "@/lib/marketing-data";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";

export function CustomerStoriesSection() {
  const [index, setIndex] = useState(0);
  const story = FEATURED_CUSTOMER_STORIES[index];
  const last = FEATURED_CUSTOMER_STORIES.length - 1;

  const go = (next: number) => {
    setIndex(
      (next + FEATURED_CUSTOMER_STORIES.length) %
        FEATURED_CUSTOMER_STORIES.length,
    );
  };

  return (
    <section className="customer-stories bg-white dark:bg-twitter-dark">
      <MarketingContainer className="py-16 md:py-28">
        <h2 className="omnih-h2 text-center whitespace-nowrap max-md:whitespace-normal">
          Hear from companies already collecting with SusuFlow.
        </h2>

        <div
          className="mt-10 md:mt-14"
          aria-roledescription="carousel"
          aria-label="Customer stories"
        >
          <div className="relative">
            <div className="story-image relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[2.15/1]">
              {FEATURED_CUSTOMER_STORIES.map((item, i) => (
                <Image
                  key={item.id}
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1120px"
                  className={cn(
                    "object-cover transition-opacity duration-500 ease-out",
                    i === index ? "opacity-100" : "opacity-0",
                  )}
                  style={{ objectPosition: item.imagePosition }}
                  priority={i === 0}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Previous customer story"
              onClick={() => go(index - 1)}
              className="story-nav absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center bg-white text-[#1a1a1a] shadow-sm transition-opacity hover:opacity-90 sm:left-4 sm:size-11 dark:bg-[#1a1a1a] dark:text-white"
            >
              <ChevronLeft className="size-5" weight="bold" />
            </button>
            <button
              type="button"
              aria-label="Next customer story"
              onClick={() => go(index + 1)}
              className="story-nav absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center bg-white text-[#1a1a1a] shadow-sm transition-opacity hover:opacity-90 sm:right-4 sm:size-11 dark:bg-[#1a1a1a] dark:text-white"
            >
              <ChevronRight className="size-5" weight="bold" />
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-6 md:mt-10 md:flex-row md:items-start md:justify-between md:gap-12">
            <blockquote key={story.id} className="max-w-3xl" aria-live="polite">
              <p className="text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                <span className="text-[#1a1a1a] dark:text-white">
                  {story.highlight}
                </span>
                {story.rest ? (
                  <span className="text-slate-500 dark:text-slate-400">
                    {" "}
                    {story.rest}
                  </span>
                ) : null}
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-[#1a1a1a] dark:text-slate-200 sm:text-base">
                &ldquo;{story.quote}&rdquo;
              </p>
              <footer className="mt-5 text-sm text-[#1a1a1a] dark:text-slate-200">
                <span className="font-semibold">{story.author}</span>
                <span className="mx-2 text-slate-400" aria-hidden>
                  |
                </span>
                <span className="font-normal text-slate-600 dark:text-slate-400">
                  {story.role}
                </span>
              </footer>
            </blockquote>

            <Link
              href={story.href}
              className="story-btn inline-flex shrink-0 items-center justify-center bg-[#f0f0f0] px-5 py-3 text-sm font-medium text-[#1a1a1a] transition-colors hover:bg-[#e6e6e6] md:mt-1 dark:bg-white/10 dark:text-white dark:hover:bg-white/16"
            >
              Read customer story
            </Link>
          </div>

          <div
            className="mt-8 flex items-center justify-center gap-2"
            role="tablist"
            aria-label="Choose a customer story"
          >
            {FEATURED_CUSTOMER_STORIES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show story ${i + 1} of ${last + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "story-dot h-1.5 transition-all",
                  i === index
                    ? "w-8 bg-[#1a1a1a] dark:bg-white"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/30",
                )}
              />
            ))}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
