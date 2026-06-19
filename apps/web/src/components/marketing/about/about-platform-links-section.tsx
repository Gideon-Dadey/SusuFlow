import Link from 'next/link';
import { ABOUT_PLATFORM_LINKS } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function AboutPlatformLinksSection() {
  return (
    <section className="border-b border-border bg-background">
      <MarketingContainer className="py-10 sm:py-12">
        <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:gap-x-4">
          {ABOUT_PLATFORM_LINKS.map(({ label, href }, index) => (
            <li key={label} className="flex items-center gap-x-2 sm:gap-x-4">
              <Link
                href={href}
                className="text-sm font-semibold text-foreground transition-colors hover:text-secondary sm:text-base"
              >
                {label}
              </Link>
              {index < ABOUT_PLATFORM_LINKS.length - 1 ? (
                <span className="hidden text-muted-foreground/40 sm:inline" aria-hidden>
                  |
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </MarketingContainer>
    </section>
  );
}
