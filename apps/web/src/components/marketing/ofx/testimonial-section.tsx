import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_TESTIMONIALS } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function OfxTestimonialSection() {
  const featured = HOME_TESTIMONIALS[0];

  return (
    <section className="bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">Here&apos;s what operators say</p>
          <h2 className="ofx-h2 mt-4">Real uplift in trust</h2>
          <blockquote className="mt-10">
            <p className="text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <footer className="mt-8">
              <p className="text-base font-semibold text-foreground">
                {featured.author}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {featured.role}
              </p>
            </footer>
          </blockquote>
          <Link href="/about" className="ofx-link mt-10 inline-flex text-sm">
            More operator stories
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </MarketingContainer>
    </section>
  );
}
