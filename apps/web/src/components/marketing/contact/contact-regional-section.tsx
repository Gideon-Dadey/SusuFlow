import { CONTACT_REGIONS } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function ContactRegionalSection() {
  return (
    <section className="border-b border-border bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Contact details and address
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-14">
          {CONTACT_REGIONS.map((region) => (
            <article
              key={region.region}
              className="rounded-lg border border-border/80 bg-white p-6 dark:border-border dark:bg-card sm:p-8 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-10"
            >
              <div>
                <h3 className="text-lg font-bold text-foreground">{region.region}</h3>
                <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground">
                  {region.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <p className="mt-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Hours:</span> {region.hours}
                </p>
              </div>
              <div className="mt-6 space-y-3 text-sm lg:mt-0">
                <p>
                  <span className="font-semibold text-foreground">Business:</span>{' '}
                  <a
                    href={`mailto:${region.businessEmail}`}
                    className="text-secondary transition-colors hover:text-secondary/80"
                  >
                    {region.businessEmail}
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-foreground">Support:</span>{' '}
                  <a
                    href={`mailto:${region.supportEmail}`}
                    className="text-secondary transition-colors hover:text-secondary/80"
                  >
                    {region.supportEmail}
                  </a>
                </p>
              </div>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
