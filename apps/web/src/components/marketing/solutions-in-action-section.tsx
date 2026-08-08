import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingContainer } from "./marketing-container";

export function SolutionsInActionSection() {
  return (
    <section className="afrusan-section bg-background">
      <MarketingContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="max-w-xl space-y-5">
            <h2 className="afrusan-section-title">
              See our solutions in action
            </h2>
            <p className="afrusan-body text-pretty">
              Book a personalised demo with our SusuFlow team. We&apos;ll walk
              you through how our solutions can support your business needs.
            </p>
            <Link href="/contact" className="afrusan-cta-pill inline-flex">
              <span>Book a live demo</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/11]">
            <Image
              src="/images/home/solutions-in-action.png"
              alt="See SusuFlow solutions in action"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
