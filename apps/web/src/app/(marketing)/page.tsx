import type { Metadata } from "next";
import { OfxAnnouncementSection } from "@/components/marketing/ofx/announcement-section";
import { OfxBlogTeaserSection } from "@/components/marketing/ofx/blog-teaser-section";
import { OfxHeroSection } from "@/components/marketing/ofx/hero-section";
import { OfxPlatformSection } from "@/components/marketing/ofx/platform-section";
import { OfxProductTabsSection } from "@/components/marketing/ofx/product-tabs-section";
import { OfxSaversBandSection } from "@/components/marketing/ofx/savers-band-section";
import { OfxTestimonialSection } from "@/components/marketing/ofx/testimonial-section";
import { APP_NAME, APP_TAGLINE } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `${APP_NAME} | Your go-to susu operations platform`,
  description: APP_TAGLINE,
};

export default function HomePage() {
  return (
    <>
      <OfxHeroSection />
      <OfxPlatformSection />
      <OfxAnnouncementSection />
      <OfxProductTabsSection />
      <OfxSaversBandSection />
      <OfxTestimonialSection />
      <OfxBlogTeaserSection />
    </>
  );
}
