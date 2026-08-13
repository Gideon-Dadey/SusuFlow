import { ABOUT_HERO_IMAGE } from "@/lib/brand-assets";
import { SplitPreview } from "../split-preview";

export function AboutHero() {
  return (
    <SplitPreview
      eyebrow="About SusuFlow"
      title="Cashless susu. Built on Ghanaian trust."
      lead="We digitize susu collections without breaking the community trust that makes savings work in Ghana. Verified MoMo deposits, transparent ledgers, and collectors who never handle cash."
      image={ABOUT_HERO_IMAGE}
      imageAlt="A susu operations leader reviewing verified collections in a Ghanaian office"
      primaryCta={{ label: "Get started for free", href: "/register" }}
      secondaryCta={{ label: "See how it works", href: "/how-it-works" }}
    />
  );
}
