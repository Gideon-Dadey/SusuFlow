import Link from "next/link";
import type { LucideIcon } from "@/components/icons/phosphor";
import { ArrowRight, BadgeCheck } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "../marketing-container";

type SectionBackground = "cream" | "paper";

const BG_CLASS: Record<SectionBackground, string> = {
  cream: "bg-[var(--ofx-cream)]",
  paper: "bg-[var(--ofx-paper)]",
};

export function ProductPageHero({
  eyebrow,
  title,
  lead,
  tile,
  mock,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  tile: string;
  mock: React.ReactNode;
  secondaryCta: { label: string; href: string };
}) {
  return (
    <section className={BG_CLASS.cream}>
      <MarketingContainer className="grid items-center gap-12 pb-16 pt-14 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pb-20 lg:pt-20">
        <div className="max-w-xl">
          <p className="ofx-eyebrow">{eyebrow}</p>
          <h1 className="ofx-display mt-4">{title}</h1>
          <p className="ofx-lead mt-6">{lead}</p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/register" className="ofx-btn ofx-btn-dark ofx-btn-lg">
              Get started for free
            </Link>
            <Link href={secondaryCta.href} className="ofx-link">
              {secondaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div
          className="flex min-h-[340px] items-center justify-center rounded-[2rem] p-6 sm:p-10"
          style={{ backgroundColor: tile }}
          aria-hidden
        >
          {mock}
        </div>
      </MarketingContainer>
    </section>
  );
}

export function ProductFeatureSplit({
  eyebrow,
  title,
  paragraphs,
  bullets,
  link,
  tile,
  mock,
  flip = false,
  background,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  link: { label: string; href: string };
  tile: string;
  mock: React.ReactNode;
  flip?: boolean;
  background: SectionBackground;
}) {
  return (
    <section className={BG_CLASS[background]}>
      <MarketingContainer className="ofx-section">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className={cn("max-w-xl", flip && "lg:order-2")}>
            <p className="ofx-eyebrow">{eyebrow}</p>
            <h2 className="ofx-h2 mt-4">{title}</h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="ofx-body mt-4">
                {paragraph}
              </p>
            ))}
            <ul className="mt-6 space-y-2.5">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-center gap-2.5 text-[15px] font-medium text-foreground"
                >
                  <BadgeCheck
                    className="h-[18px] w-[18px] shrink-0 text-[var(--ofx-flame)]"
                    aria-hidden
                  />
                  {bullet}
                </li>
              ))}
            </ul>
            <Link href={link.href} className="ofx-link mt-8 inline-flex">
              {link.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div
            className={cn(
              "flex min-h-[300px] items-center justify-center rounded-[2rem] p-6 sm:p-10",
              flip && "lg:order-1",
            )}
            style={{ backgroundColor: tile }}
            aria-hidden
          >
            {mock}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}

export function ProductStatsBand({
  background,
  title,
  lead,
  stats,
}: {
  background: SectionBackground;
  title: string;
  lead?: string;
  stats: { value: string; label: string }[];
}) {
  return (
    <section className={BG_CLASS[background]}>
      <MarketingContainer className="ofx-section">
        <div className="ofx-dark-section rounded-[2rem] p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl">
            <h2 className="ofx-h2">{title}</h2>
            {lead ? <p className="ofx-lead mt-4">{lead}</p> : null}
          </div>
          <div className="mt-10 grid gap-x-8 gap-y-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm leading-snug text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}

export function ProductCrossLinks({
  background,
  links,
}: {
  background: SectionBackground;
  links: {
    title: string;
    description: string;
    href: string;
    tile: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <section className={BG_CLASS[background]}>
      <MarketingContainer className="ofx-section">
        <p className="ofx-eyebrow">Keep exploring</p>
        <h2 className="ofx-h2 mt-4 max-w-2xl">Explore more of the platform</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {links.map(({ title, description, href, tile, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="ofx-card group flex flex-col p-7 transition-shadow hover:shadow-[0_24px_48px_-32px_rgba(28,27,23,0.35)] sm:p-8"
            >
              <span
                className="flex size-11 items-center justify-center rounded-full"
                style={{ backgroundColor: tile }}
              >
                <Icon className="h-5 w-5 text-foreground" aria-hidden />
              </span>
              <h3 className="ofx-h3 mt-5">{title}</h3>
              <p className="ofx-body mt-2">{description}</p>
              <span className="ofx-link mt-6">
                Explore
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
  );
}
