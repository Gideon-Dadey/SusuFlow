import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingContainer } from "./marketing-container";

export function RealPeopleHelpSection() {
  return (
    <section className="bg-background py-12 lg:py-20 border-t border-border/40">
      <MarketingContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Left Column: Image */}
          <div className="relative rounded-[1.75rem] overflow-hidden shadow-md border border-border/40 bg-muted/30 aspect-[4/3] sm:aspect-[16/11]">
            <Image
              src="/images/home/real-help.png"
              alt="Real people real help customer support"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right Column: Content */}
          <div className="space-y-4 sm:space-y-6 max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
              Real people. Real help.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
              Have a question? We’re on hand 24/7 to support you. Call or email
              us anytime.
            </p>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#0066cc] hover:text-[#0052a3] transition-colors group"
              >
                <span>Contact us</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
