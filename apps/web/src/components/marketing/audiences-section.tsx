import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AUDIENCES } from '@/lib/marketing-data';
import { Button } from '@/components/ui/button';
import { MarketingContainer } from './marketing-container';
import { SectionHeader } from './section-header';

export function AudiencesSection() {
  return (
    <section className="marketing-section border-t border-border bg-muted/30">
      <MarketingContainer>
        <SectionHeader
          title="One platform, every role"
          description="Whether you save, collect, or run the company — SusuFlow gives you the right tools."
        />
        <div className="marketing-section-grid sm:grid-cols-2 xl:grid-cols-4">
          {AUDIENCES.map(({ title, description, cta, href }) => (
            <div
              key={title}
              className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-card sm:p-8 xl:p-9"
            >
              <h3 className="text-base font-bold text-foreground sm:text-lg">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <Link href={href} className="mt-6">
                <Button variant="outline" size="sm" className="group w-full rounded-lg sm:w-auto">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
