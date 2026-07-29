import type { Metadata } from "next";
import { ContactFormSection } from "@/components/marketing/contact/contact-form-section";
import { ContactHero } from "@/components/marketing/contact/contact-hero";
import { APP_NAME } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `Contact us | ${APP_NAME}`,
  description:
    "Contact Credo for demos, support, and partnerships. We help Ghanaian susu companies go cashless with verified MoMo collections.",
};

export default function ContactPage() {
  return (
    <>
      <ContactHero />
      <ContactFormSection />
    </>
  );
}
