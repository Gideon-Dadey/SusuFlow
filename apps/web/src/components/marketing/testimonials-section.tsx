"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { HOME_TESTIMONIALS } from "@/lib/marketing-data";
import { MarketingContainer } from "./marketing-container";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGE = HOME_TESTIMONIALS.find(
  (item) => "image" in item && item.image,
)?.image;

function getTestimonialImage(item: (typeof HOME_TESTIMONIALS)[number]) {
  return "image" in item && item.image ? item.image : FALLBACK_IMAGE;
}

function getTestimonialImagePosition(item: (typeof HOME_TESTIMONIALS)[number]) {
  return "imagePosition" in item && item.imagePosition
    ? item.imagePosition
    : "center 28%";
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M14.5 0C8.5 0 4 5.2 4 12.5c0 7.8 5.2 14.2 12.8 17.5-1.2 3.5-3.5 6.5-6.8 8.5l2.8 4.5c5.5-3.5 9.2-8.8 10.5-15.2 5.8-2.2 9.7-7.5 9.7-14.5C33 5.2 28.5 0 22.5 0h-8zm25 0c-6 0-10.5 5.2-10.5 12.5 0 7.8 5.2 14.2 12.8 17.5-1.2 3.5-3.5 6.5-6.8 8.5l2.8 4.5c5.5-3.5 9.2-8.8 10.5-15.2 5.8-2.2 9.7-7.5 9.7-14.5C58 5.2 53.5 0 47.5 0h-8z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const testimonial = HOME_TESTIMONIALS[index];

  const goNext = () => {
    setIndex((current) =>
      current === HOME_TESTIMONIALS.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <section className="marketing-band-height relative overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        {FALLBACK_IMAGE ? (
          HOME_TESTIMONIALS.map((item, slideIndex) => {
            const src = getTestimonialImage(item);
            if (!src) return null;

            return (
              <Image
                key={item.author}
                src={src}
                alt=""
                fill
                sizes="100vw"
                className={cn(
                  "object-cover transition-opacity duration-500",
                  slideIndex === index ? "opacity-100" : "opacity-0",
                )}
                style={{ objectPosition: getTestimonialImagePosition(item) }}
                priority={slideIndex === 0}
                aria-hidden
              />
            );
          })
        ) : (
          <div className="absolute inset-0 bg-[#1a1a1a]" />
        )}
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"
        aria-hidden
      />

      <MarketingContainer className="relative z-10 flex h-full items-center py-8 sm:py-10">
        <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-6">
          <h2 className="font-geist text-4xl font-medium tracking-tight text-white sm:text-5xl lg:col-span-4 lg:text-[3.25rem] lg:leading-[1.05]">
            Testimonials
          </h2>

          <div className="flex items-center gap-4 sm:gap-6 lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-6">
            <div className="min-w-0 flex-1">
              <QuoteMark className="mb-4 h-8 w-10 text-white/90 sm:h-10 sm:w-12" />

              <blockquote>
                <p className="max-w-2xl text-lg font-normal leading-relaxed text-white sm:text-xl lg:text-[1.35rem] lg:leading-[1.65]">
                  {testimonial.quote}
                </p>
                <footer className="mt-5 text-base text-white/85 sm:mt-6">
                  <span>— {testimonial.author}</span>
                  {testimonial.role ? (
                    <span className="mt-1 block text-sm text-white/65">
                      {testimonial.role}
                    </span>
                  ) : null}
                </footer>
              </blockquote>
            </div>

            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:h-14 sm:w-14"
              aria-label="Next testimonial"
            >
              <ChevronRight
                className="h-6 w-6 sm:h-7 sm:w-7"
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {HOME_TESTIMONIALS.map((item, dotIndex) => (
            <button
              key={item.author}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2 rounded-full transition-all ${
                dotIndex === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Show testimonial ${dotIndex + 1}`}
            />
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
