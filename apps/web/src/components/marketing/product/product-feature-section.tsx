import Image from "next/image";
import { MarketingContainer } from "../marketing-container";
import { cn } from "@/lib/utils";

export interface ProductFeature {
  id: string;
  title: string;
  description: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  isMockup?: boolean;
}

export interface ProductFeatureSectionProps {
  features: ProductFeature[];
}

export function ProductFeatureSection({
  features,
}: ProductFeatureSectionProps) {
  return (
    <section className="afrusan-section overflow-hidden bg-background">
      <MarketingContainer>
        <div className="flex flex-col gap-20 sm:gap-24">
          {features.map((feature, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div
                key={feature.id}
                id={feature.id}
                className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <div
                  className={cn(
                    "order-2 lg:order-none",
                    isReversed ? "lg:order-2" : "lg:order-1",
                  )}
                >
                  <h2 className="afrusan-section-title text-balance">
                    {feature.title}
                  </h2>
                  <div className="afrusan-body mt-6 space-y-6">
                    {feature.description}
                  </div>
                </div>

                <div
                  className={cn(
                    "order-1 relative mx-auto w-full max-w-xl lg:order-none lg:max-w-none",
                    isReversed ? "lg:order-1" : "lg:order-2",
                  )}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={cn(
                        feature.isMockup
                          ? "object-contain object-center"
                          : "object-cover object-center",
                      )}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
