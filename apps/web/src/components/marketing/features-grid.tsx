import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookOpen,
  faBuilding,
  faChartLine,
  faClipboardList,
  faMobileScreenButton,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FEATURES } from '@/lib/marketing-data';
import { MarketingContainer } from './marketing-container';
import { SectionHeader } from './section-header';

const FEATURE_ICONS: IconDefinition[] = [
  faMobileScreenButton,
  faBookOpen,
  faBuilding,
  faUserGroup,
  faChartLine,
  faClipboardList,
];

export function FeaturesGrid() {
  return (
    <section className="marketing-section bg-muted/40">
      <MarketingContainer>
        <SectionHeader
          title="Built for trust, designed for Ghana"
          description="Everything susu companies need to go cashless — without losing the human relationships that make susu work."
        />
        <div className="marketing-section-grid sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const icon = FEATURE_ICONS[i];
            return (
              <div key={feature.title} className="premium-card p-6 sm:p-7 xl:p-8">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  {icon ? <FontAwesomeIcon icon={icon} className="h-5 w-5" /> : null}
                </div>
                <h3 className="text-base font-bold text-foreground sm:text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
