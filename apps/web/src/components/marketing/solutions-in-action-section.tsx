import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingContainer } from "./marketing-container";
import { Button } from "@/components/ui/button";

export function SolutionsInActionSection() {
  return (
    <section className="bg-background py-12 lg:py-20 border-t border-border/40">
      <MarketingContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Left Column: Text & CTA */}
          <div className="space-y-4 sm:space-y-6 max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
              See our solutions in action
            </h2>

            <p className="text-[17px] text-muted-foreground leading-relaxed text-pretty">
              Book a personalised demo with our SusuFlow team. We’ll walk you
              through how our solutions can support your business needs.
            </p>

            <div className="pt-2">
              <Link
                href="/contact"
                className="w-[85%] max-w-[320px] sm:max-w-none sm:w-auto"
              >
                <Button
                  size="lg"
                  className="h-12 w-[85%] max-w-[320px] sm:max-w-none sm:w-auto rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white px-6 text-[17px] font-semibold flex items-center justify-center gap-2.5 sm:w-auto sm:min-w-[12rem]"
                >
                  <span>Book a Live Demo</span>
                  <ArrowRight
                    className="h-[18px] w-[18px] stroke-[2.25]"
                    aria-hidden
                  />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative rounded-[1.75rem] overflow-hidden shadow-md border border-border/40 bg-muted/30 aspect-[4/3] sm:aspect-[16/11]">
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
