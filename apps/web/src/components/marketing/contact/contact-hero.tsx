import { CONTACT_MAP_IMAGE } from "@/lib/brand-assets";
import { SUPPORT_EMAIL } from "@/lib/marketing-data";
import { SplitPreview } from "../split-preview";

export function ContactHero() {
  return (
    <SplitPreview
      eyebrow="Contact"
      title="Real people. Real help."
      lead="Questions about the platform, pricing, or onboarding your susu company? Share a few details and a member of our team will be in touch within one business day."
      image={CONTACT_MAP_IMAGE}
      imageAlt="SusuFlow office location in Kumasi, Ghana"
      primaryCta={{ label: "Send a message", href: "#contact-form" }}
      secondaryCta={{
        label: "Email us instead",
        href: `mailto:${SUPPORT_EMAIL}`,
      }}
    />
  );
}
