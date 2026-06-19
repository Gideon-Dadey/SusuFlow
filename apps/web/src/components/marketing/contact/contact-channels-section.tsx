import { CONTACT_CHANNELS } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function ContactChannelsSection() {
  return (
    <section className="border-b border-border bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            With a Ghana first team, we are here to help
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8 lg:mt-14">
          {CONTACT_CHANNELS.map(({ title, subtitle, email }) => (
            <article
              key={title}
              className="rounded-lg border border-border/80 bg-white p-6 dark:border-border dark:bg-card sm:p-8"
            >
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
              <p className="mt-6 text-sm">
                <span className="font-semibold text-foreground">Email:</span>{' '}
                <a
                  href={`mailto:${email}`}
                  className="font-medium text-secondary transition-colors hover:text-secondary/80"
                >
                  {email}
                </a>
              </p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
