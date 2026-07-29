"use client";

import Image from "next/image";
import { BRAND_HERO_SHOWCASE } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

export function HeroProductShowcase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hero-showcase relative mx-auto w-full max-w-[34rem] lg:max-w-none",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 top-8 hidden h-[72%] w-[88%] rounded-2xl bg-gradient-to-br from-[#0056d2]/10 via-transparent to-sky-400/10 blur-3xl lg:block"
        aria-hidden
      />
      <div className="hero-showcase-frame relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[5/4]">
        <Image
          src={BRAND_HERO_SHOWCASE}
          alt="Credo dashboard on tablet and mobile showing verified MoMo susu deposits and group savings"
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 50vw"
          className="object-contain object-center drop-shadow-[0_24px_48px_rgba(15,23,42,0.12)]"
        />
      </div>
    </div>
  );
}
