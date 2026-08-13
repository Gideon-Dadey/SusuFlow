import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "@/components/icons/phosphor";
import { ArrowRight } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "../marketing-container";
import { MicroLabel } from "../micro-label";
import { SplitPreview } from "../split-preview";

type SectionBackground = "cream" | "paper";

const BG_CLASS: Record<SectionBackground, string> = {
  cream: "bg-[#f7f7f7] dark:bg-slate-900",
  paper: "bg-white dark:bg-twitter-dark",
};

export function ProductPageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  tile: _tile,
  mock: _mock,
  secondaryCta,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image?: string;
  imageAlt?: string;
  tile?: string;
  mock?: React.ReactNode;
  secondaryCta: { label: string; href: string };
}) {
  return (
    <SplitPreview
      eyebrow={eyebrow}
      title={title}
      lead={lead}
      image={image ?? "/marketing/susu-trader-payment.png"}
      imageAlt={imageAlt ?? ""}
      primaryCta={{ label: "Get started for free", href: "/register" }}
      secondaryCta={secondaryCta}
    />
  );
}

export function ProductFeatureSplit({
  eyebrow,
  title,
  paragraphs,
  bullets,
  link,
  image,
  imageAlt,
  tile: _tile,
  mock: _mock,
  flip = false,
  background,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
  link: { label: string; href: string };
  image?: string;
  imageAlt?: string;
  tile?: string;
  mock?: React.ReactNode;
  flip?: boolean;
  background: SectionBackground;
}) {
  return (
    <section className={BG_CLASS[background]}>
      <MarketingContainer className="py-16 md:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className={cn("max-w-xl", flip && "lg:order-2")}>
            <MicroLabel>{eyebrow}</MicroLabel>
            <h2 className="omnih-h2 mt-4">{title}</h2>
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="omnih-body mt-4">
                {paragraph}
              </p>
            ))}
            <ul className="mt-6 space-y-2.5">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-center gap-2.5 text-[15px] font-medium text-[#1a1a1a] dark:text-white"
                >
                  <span className="omnih-micro-dot" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
            <Link href={link.href} className="ofx-link mt-8 inline-flex">
              {link.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className={cn(flip && "lg:order-1")}>
            <div className="relative aspect-[1.48] overflow-hidden">
              <Image
                src={image ?? "/marketing/susu-field-collector.png"}
                alt={imageAlt ?? ""}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
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
      <MarketingContainer className="py-16 md:py-28">
        <div className="max-w-2xl">
          <h2 className="omnih-h2">{title}</h2>
          {lead ? <p className="omnih-body mt-4">{lead}</p> : null}
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-10 border-t border-slate-200 pt-10 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-semibold tracking-tight text-[#1a1a1a] dark:text-white">
                {stat.value}
              </p>
              <p className="mt-3 text-sm leading-snug text-slate-600 dark:text-slate-400">
                {stat.label}
              </p>
            </div>
          ))}
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
    tile?: string;
    icon: LucideIcon;
  }[];
}) {
  return (
    <section className={BG_CLASS[background]}>
      <MarketingContainer className="py-16 md:py-28">
        <MicroLabel>Keep exploring</MicroLabel>
        <h2 className="omnih-h2 mt-4 max-w-2xl">
          Explore more of the platform
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {links.map(({ title, description, href }) => (
            <Link key={href} href={href} className="group block">
              <h3 className="text-xl font-medium text-[#1a1a1a] dark:text-white">
                {title}
              </h3>
              <p className="omnih-body mt-2">{description}</p>
              <span className="ofx-link mt-4">
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
