import { MarketingContainer } from '../marketing-container';

export function AboutTeamSection() {
  return (
    <section id="mission" className="scroll-mt-24 border-t border-border bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            A Ghana first team
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground lg:mx-auto">
            We build for susu operators in Accra, Kumasi, Tamale, and communities nationwide. We
            understand collector routes, market day cycles, and the trust model that makes susu work.
          </p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:mx-auto">
            We are part of the same local communities as our clients, while building a platform that
            scales from a single collector team to multi branch susu companies.
          </p>
        </div>
      </MarketingContainer>
    </section>
  );
}
