import { ABOUT_OPERATING_DETAILS } from '@/lib/marketing-data';
import { MarketingContainer } from '../marketing-container';

export function AboutDetailsSection() {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-left lg:text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Our operating details in Ghana
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground lg:mx-auto">
            SusuFlow serves susu companies across Ghana with Mobile Money integrations and platform
            support aligned to local payment practices.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-border lg:mt-12">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead className="bg-[#1a1a1a] text-white dark:bg-muted dark:text-foreground">
              <tr>
                <th className="px-4 py-3 text-sm font-bold sm:px-6">Region</th>
                <th className="px-4 py-3 text-sm font-bold sm:px-6">Entity</th>
                <th className="px-4 py-3 text-sm font-bold sm:px-6">Payment partners</th>
                <th className="px-4 py-3 text-sm font-bold sm:px-6">Standards</th>
              </tr>
            </thead>
            <tbody>
              {ABOUT_OPERATING_DETAILS.map((row) => (
                <tr key={row.region} className="border-t border-border bg-white dark:bg-card">
                  <td className="px-4 py-4 text-sm font-medium text-foreground sm:px-6">
                    {row.region}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground sm:px-6">{row.entity}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground sm:px-6">{row.partners}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground sm:px-6">{row.standards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketingContainer>
    </section>
  );
}
