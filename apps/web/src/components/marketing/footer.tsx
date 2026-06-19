import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { APP_NAME, APP_TAGLINE, FOOTER_LINKS, SUPPORT_EMAIL } from '@/lib/marketing-data';
import { BrandLockup } from '@/components/marketing/brand-logo';
import { MarketingContainer } from './marketing-container';

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <MarketingContainer className="py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <BrandLockup wordmarkClassName="text-xl" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {APP_TAGLINE}
            </p>
            <p className="mt-2 text-sm text-muted-foreground/80">
              Built for susu companies, collectors, and savers across Ghana. Cashless, verified,
              and audit-ready.
            </p>
            <div className="mt-6 space-y-3">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 shrink-0 text-secondary" />
                {SUPPORT_EMAIL}
              </a>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 shrink-0 text-secondary" />
                Accra, Ghana
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.product.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legal</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.legal.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {year} {APP_NAME}. All rights reserved.
        </div>
      </MarketingContainer>
    </footer>
  );
}
