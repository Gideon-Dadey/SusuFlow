import type { Metadata } from 'next';
import { ContactChannelsSection } from '@/components/marketing/contact/contact-channels-section';
import { ContactFormSection } from '@/components/marketing/contact/contact-form-section';
import { ContactHelpSection } from '@/components/marketing/contact/contact-help-section';
import { ContactHero } from '@/components/marketing/contact/contact-hero';
import { ContactRegionalSection } from '@/components/marketing/contact/contact-regional-section';
import { APP_NAME } from '@/lib/marketing-data';

export const metadata: Metadata = {
  title: `Contact us | ${APP_NAME}`,
  description:
    'Contact SusuFlow for demos, support, and partnerships. We help Ghanaian susu companies go cashless with verified MoMo collections.',
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactChannelsSection />
      <ContactRegionalSection />
      <ContactHelpSection />
      <ContactFormSection />
    </>
  );
}
