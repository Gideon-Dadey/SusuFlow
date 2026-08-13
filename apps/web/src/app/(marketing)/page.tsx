import type { Metadata } from "next";
import Link from "next/link";
import { CustomerStoriesSection } from "@/components/marketing/customer-stories-section";
import { PhotoHero } from "@/components/marketing/photo-hero";
import { ProductOfferSection } from "@/components/marketing/product-offer-section";
import { ResourceArticleCard } from "@/components/marketing/resource-article-card";
import { SplitPreview } from "@/components/marketing/split-preview";
import { VisionQuoteSection } from "@/components/marketing/vision-quote-section";
import { MarketingContainer } from "@/components/marketing/marketing-container";
import { MicroLabel } from "@/components/marketing/micro-label";
import {
  HOME_HERO_IMAGE,
  HOW_IT_WORKS_DIGITAL_COLLECTOR,
} from "@/lib/brand-assets";
import { APP_NAME, APP_TAGLINE, RESOURCE_ARTICLES } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: `${APP_NAME} | Your go to susu operations platform`,
  description: APP_TAGLINE,
};

const ARTICLE_IMAGES = [
  "/marketing/why-susuflow/cashless.png",
  "/marketing/why-susuflow/fraud.png",
  "/marketing/why-susuflow/accounting.png",
];

export default function HomePage() {
  return (
    <>
      <PhotoHero
        title="One platform for your susu company."
        support="Verified MoMo deposits, live ledgers and fast, secure payouts. So every cedi is confirmed before it hits the books."
        image={HOME_HERO_IMAGE}
        imageAlt="A Ghanaian market trader completing a susu contribution by Mobile Money with a field collector"
        primaryCta={{ label: "Get started for free", href: "/register" }}
        secondaryCta={{ label: "See how it works", href: "/how-it-works" }}
      />

      <VisionQuoteSection
        label="Operating system"
        quote="Every cedi should be verified before it touches the ledger. So susu companies can grow without notebook disputes."
      />

      <SplitPreview
        as="h2"
        eyebrow="Field collections"
        title="Cash never has to change hands."
        lead="Collectors onboard members and send MoMo prompts at the stall. Members pay from their own wallet. The gateway confirms. The ledger updates."
        image={HOW_IT_WORKS_DIGITAL_COLLECTOR}
        imageAlt="A SusuFlow collector helping a saver complete a Mobile Money deposit"
        primaryCta={{
          label: "Explore collections",
          href: "/product/accounts-and-payments",
        }}
        secondaryCta={{ label: "How it works", href: "/how-it-works" }}
      />

      <ProductOfferSection />

      <CustomerStoriesSection />

      <section className="bg-[#f7f7f7] dark:bg-twitter-dark">
        <MarketingContainer className="py-16 md:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <MicroLabel>Insights</MicroLabel>
              <h2 className="omnih-h2 mt-4">The latest from SusuFlow</h2>
            </div>
            <Link href="/resources" className="ofx-link text-sm">
              See all articles
            </Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {RESOURCE_ARTICLES.slice(0, 3).map((article, i) => (
              <ResourceArticleCard
                key={article.slug}
                article={article}
                image={ARTICLE_IMAGES[i]}
                imageAlt=""
              />
            ))}
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}
