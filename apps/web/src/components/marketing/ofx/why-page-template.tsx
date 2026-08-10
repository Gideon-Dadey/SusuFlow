import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MarketingContainer } from "../marketing-container";

export type WhyPastel = "sage" | "sky" | "sand" | "lilac";

const PASTEL_VAR: Record<WhyPastel, string> = {
  sage: "var(--ofx-sage)",
  sky: "var(--ofx-sky)",
  sand: "var(--ofx-sand)",
  lilac: "var(--ofx-lilac)",
};

const PASTEL_ORDER: WhyPastel[] = ["sage", "sky", "sand", "lilac"];

const BG = {
  cream: "bg-[var(--ofx-cream)]",
  paper: "bg-[var(--ofx-paper)]",
} as const;

export interface WhyTileRow {
  label: string;
  value?: string;
  status?: string;
  statusTone?: "good" | "bad" | "muted";
}

export interface WhyHeroTile {
  /** Small label above the big value. */
  label: string;
  /** Big stat or headline value. */
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

const STATUS_TONE_CLASS = {
  good: "text-emerald-700",
  bad: "text-[var(--ofx-flame)]",
  muted: "text-muted-foreground",
} as const;

function TileRows({ rows }: { rows: WhyTileRow[] }) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value ?? ""}`}
          className="flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.label}
            </p>
            {row.value ? (
              <p className="text-xs text-muted-foreground">{row.value}</p>
            ) : null}
          </div>
          {row.status ? (
            <span
              className={`shrink-0 text-[11px] font-semibold ${STATUS_TONE_CLASS[row.statusTone ?? "good"]}`}
            >
              {row.status}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function HeroTile({ tile, accent }: { tile: WhyHeroTile; accent: WhyPastel }) {
  return (
    <div
      className="flex items-center justify-center rounded-[2rem] p-8 sm:p-12"
      style={{ backgroundColor: PASTEL_VAR[accent] }}
      aria-hidden
    >
      <div className="w-full max-w-[340px] rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-muted-foreground">
            {tile.label}
          </p>
          {tile.badge ? (
            <span
              className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[11px] font-semibold text-foreground"
              style={{ backgroundColor: PASTEL_VAR[accent] }}
            >
              {tile.badge}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          {tile.value}
        </p>
        {tile.caption ? (
          <p className="mt-1 text-xs text-muted-foreground">{tile.caption}</p>
        ) : null}
        {tile.rows?.length ? (
          <div className="mt-5 border-t border-border/70 pt-5">
            <TileRows rows={tile.rows} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MockTile({ tile, accent }: { tile: WhyMockTile; accent: WhyPastel }) {
  return (
    <div
      className="flex items-center justify-center rounded-[2rem] p-8 sm:p-12"
      style={{ backgroundColor: PASTEL_VAR[accent] }}
      aria-hidden
    >
      <div className="w-full max-w-[360px] rounded-3xl border border-border bg-white p-6 shadow-[0_32px_64px_-32px_rgba(28,27,23,0.35)]">
        <p className="border-b border-border/70 pb-4 text-[13px] font-semibold text-foreground">
          {tile.heading}
        </p>
        <div className="pt-4">
          <TileRows rows={tile.rows} />
        </div>
        {tile.footer ? (
          <p className="mt-5 border-t border-border/70 pt-4 text-xs text-muted-foreground">
            {tile.footer}
          </p>
        ) : null}
      </div>
    </div>
  );
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
  const accentIndex = PASTEL_ORDER.indexOf(accent);
  const pastelAt = (offset: number) =>
    PASTEL_ORDER[(accentIndex + offset) % PASTEL_ORDER.length];

  const quoteBg = sections.length % 2 === 0 ? BG.cream : BG.paper;
  const relatedBg = quoteBg === BG.cream ? BG.paper : BG.cream;

  return (
    <>
      {/* Hero */}
      <section className={BG.cream}>
        <MarketingContainer className="grid items-center gap-12 pb-16 pt-14 sm:pt-16 lg:grid-cols-2 lg:gap-10 lg:pb-20 lg:pt-20">
          <div className="max-w-xl">
            <p className="ofx-eyebrow">{hero.eyebrow ?? "Why SusuFlow"}</p>
            <h1 className="ofx-display mt-4">{hero.title}</h1>
            <p className="ofx-lead mt-6">{hero.lead}</p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link
                href="/register"
                className="ofx-btn ofx-btn-dark ofx-btn-lg"
              >
                Get started for free
              </Link>
              <Link href="/contact?intent=demo" className="ofx-link">
                Book a demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
          {hero.tile ? <HeroTile tile={hero.tile} accent={accent} /> : null}
        </MarketingContainer>
      </section>

      {/* Highlights */}
      <section className={BG.paper}>
        <MarketingContainer className="ofx-section">
          <div className="mx-auto max-w-3xl text-center">
            {highlightsHeading.eyebrow ? (
              <p className="ofx-eyebrow">{highlightsHeading.eyebrow}</p>
            ) : null}
            <h2 className="ofx-h2 mt-4">{highlightsHeading.title}</h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="ofx-card p-7">
                <span
                  className="flex size-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: PASTEL_VAR[pastelAt(i)] }}
                >
                  <Icon className="h-5 w-5 text-foreground" aria-hidden />
                </span>
                <h3 className="ofx-h3 mt-5">{title}</h3>
                <p className="ofx-body mt-3 text-foreground/70">{body}</p>
              </div>
            ))}
          </div>
        </MarketingContainer>
      </section>

      {/* Split sections */}
      {sections.map((section, i) => (
        <section
          key={section.title}
          className={i % 2 === 0 ? BG.cream : BG.paper}
        >
          <MarketingContainer className="ofx-section grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
              {section.eyebrow ? (
                <p className="ofx-eyebrow">{section.eyebrow}</p>
              ) : null}
              <h2 className="ofx-h2 mt-4">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 32)}
                  className="ofx-body mt-4 max-w-xl text-foreground/70"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
              <MockTile tile={section.tile} accent={pastelAt(i + 1)} />
            </div>
          </MarketingContainer>
        </section>
      ))}

      {/* Pull-quote band */}
      <section className={quoteBg}>
        <MarketingContainer className="ofx-section">
          {quote.variant === "dark" ? (
            <div className="ofx-dark-section rounded-[2rem] px-8 py-14 text-center sm:px-14 sm:py-16">
              <h2 className="ofx-h2 mx-auto max-w-3xl">
                &ldquo;{quote.text}&rdquo;
              </h2>
              {quote.attribution ? (
                <p className="mt-6 text-sm font-medium opacity-70">
                  {quote.attribution}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="ofx-h2">&ldquo;{quote.text}&rdquo;</h2>
              {quote.attribution ? (
                <p className="mt-6 text-sm font-medium text-muted-foreground">
                  {quote.attribution}
                </p>
              ) : null}
            </div>
          )}
        </MarketingContainer>
      </section>

      {/* Related pages */}
      <section className={relatedBg}>
        <MarketingContainer className="ofx-section">
          <p className="ofx-eyebrow">Keep exploring</p>
          <h2 className="ofx-h2 mt-4">More reasons to switch</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="ofx-card group flex flex-col p-7 transition-shadow hover:shadow-[0_24px_48px_-24px_rgba(28,27,23,0.3)]"
              >
                <p className="ofx-eyebrow">Why SusuFlow</p>
                <h3 className="ofx-h3 mt-3">{link.title}</h3>
                <p className="ofx-body mt-3 flex-1 text-foreground/70">
                  {link.description}
                </p>
                <span className="ofx-link mt-6 text-sm">
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
