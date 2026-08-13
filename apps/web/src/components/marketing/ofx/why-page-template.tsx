import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/components/icons/phosphor";
import type { LucideIcon } from "@/components/icons/phosphor";
import { MarketingContainer } from "../marketing-container";
import { MicroLabel } from "../micro-label";
import { SplitPreview } from "../split-preview";
import { VisionQuoteSection } from "../vision-quote-section";

export type WhyPastel = "sage" | "sky" | "sand" | "lilac";

const ACCENT_IMAGE: Record<WhyPastel, string> = {
  sage: "/marketing/susu-field-collector.png",
  sky: "/marketing/susu-office-manager.png",
  sand: "/marketing/susu-trader-payment.png",
  lilac: "/marketing/susu-enterprise-tech.png",
};

const PASTEL_ORDER: WhyPastel[] = ["sage", "sky", "sand", "lilac"];

export interface WhyTileRow {
  label: string;
  value?: string;
  status?: string;
  statusTone?: "good" | "bad" | "muted";
}

export interface WhyHeroTile {
  label: string;
  value: string;
  caption?: string;
  badge?: string;
  rows?: WhyTileRow[];
}

export interface WhyHero {
  eyebrow?: string;
  title: string;
  lead: string;
  tile?: WhyHeroTile;
  image?: string;
  imageAlt?: string;
}

export interface WhyHighlight {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface WhyMockTile {
  heading: string;
  rows: WhyTileRow[];
  footer?: string;
}

export interface WhySplitSection {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  tile: WhyMockTile;
  image?: string;
  imageAlt?: string;
}

export interface WhyQuote {
  text: string;
  attribution?: string;
  variant?: "dark" | "light";
}

export interface WhyRelatedLink {
  title: string;
  description: string;
  href: string;
}

export interface WhyPageTemplateProps {
  accent: WhyPastel;
  hero: WhyHero;
  highlightsHeading: { eyebrow?: string; title: string };
  highlights: WhyHighlight[];
  sections: WhySplitSection[];
  quote: WhyQuote;
  related: WhyRelatedLink[];
}

export function WhyPageTemplate({
  accent,
  hero,
  highlightsHeading,
  highlights,
  sections,
  quote,
  related,
}: WhyPageTemplateProps) {
  const imageAt = (offset: number) =>
    ACCENT_IMAGE[PASTEL_ORDER[(PASTEL_ORDER.indexOf(accent) + offset) % 4]];

  return (
    <>
      <SplitPreview
        eyebrow={hero.eyebrow ?? "Why SusuFlow"}
        title={hero.title}
        lead={hero.lead}
        image={hero.image ?? ACCENT_IMAGE[accent]}
        imageAlt={hero.imageAlt ?? ""}
        primaryCta={{ label: "Get started for free", href: "/register" }}
        secondaryCta={{ label: "Book a demo", href: "/contact?intent=demo" }}
      />

      <section className="bg-white dark:bg-twitter-dark">
        <MarketingContainer className="py-16 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            {highlightsHeading.eyebrow ? (
              <MicroLabel className="justify-center">
                {highlightsHeading.eyebrow}
              </MicroLabel>
            ) : null}
            <h2 className="omnih-h2 mt-4">{highlightsHeading.title}</h2>
          </div>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ title, body }) => (
              <div key={title}>
                <h3 className="text-xl font-medium text-[#1a1a1a] dark:text-white md:text-2xl">
                  {title}
                </h3>
                <p className="omnih-body mt-3">{body}</p>
              </div>
            ))}
          </div>
        </MarketingContainer>
      </section>

      {sections.map((section, i) => (
        <section
          key={section.title}
          className={
            i % 2 === 0
              ? "bg-[#f7f7f7] dark:bg-slate-900"
              : "bg-white dark:bg-twitter-dark"
          }
        >
          <MarketingContainer className="grid items-center gap-12 py-16 md:py-28 lg:grid-cols-2 lg:gap-16">
            <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
              {section.eyebrow ? (
                <MicroLabel>{section.eyebrow}</MicroLabel>
              ) : null}
              <h2 className="omnih-h2 mt-4">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="omnih-body mt-4 max-w-xl"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
              <div className="relative aspect-[1.48] overflow-hidden">
                <Image
                  src={section.image ?? imageAt(i + 1)}
                  alt={section.imageAlt ?? ""}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              </div>
            </div>
          </MarketingContainer>
        </section>
      ))}

      <VisionQuoteSection
        label="Why it matters"
        quote={quote.text}
        attribution={quote.attribution}
      />

      <section className="bg-white dark:bg-twitter-dark">
        <MarketingContainer className="py-16 md:py-28">
          <MicroLabel>Keep exploring</MicroLabel>
          <h2 className="omnih-h2 mt-4">More reasons to switch</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <h3 className="text-xl font-medium text-[#1a1a1a] dark:text-white">
                  {link.title}
                </h3>
                <p className="omnih-body mt-2">{link.description}</p>
                <span className="ofx-link mt-4 text-sm">
                  Read more
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            ))}
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}
