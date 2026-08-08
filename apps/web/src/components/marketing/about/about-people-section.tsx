import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ABOUT_PEOPLE } from "@/lib/marketing-data";
import { MarketingContainer } from "../marketing-container";

export function AboutPeopleSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {ABOUT_PEOPLE.map(({ title, description, href, cta }) => (
            <article
              key={title}
              className="flex flex-col rounded-none border border-border/80 bg-card p-6 shadow-sm sm:p-8"
            >
              <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                {title}
              </h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
              <Link
                href={href}
                className="mt-6 inline-flex items-center gap-1.5 text-base font-semibold text-secondary transition-colors hover:text-secondary/80"
              >
                {cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
