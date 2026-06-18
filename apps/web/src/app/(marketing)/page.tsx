import type { Metadata } from 'next';
import { AudiencesSection } from '@/components/marketing/audiences-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { FaqSection } from '@/components/marketing/faq-section';
import { FeaturesGrid } from '@/components/marketing/features-grid';
import { MarketingHero } from '@/components/marketing/hero';
import { HowItWorksSection } from '@/components/marketing/how-it-works';
import { APP_NAME, APP_TAGLINE } from '@/lib/marketing-data';

export const metadata: Metadata = {
  title: `${APP_NAME} — Digital Susu Savings for Ghana`,
  description: APP_TAGLINE,
};

export default function HomePage() {
  return (
    <>
      <MarketingHero />
      <HowItWorksSection />
      <FeaturesGrid />
      <AudiencesSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
