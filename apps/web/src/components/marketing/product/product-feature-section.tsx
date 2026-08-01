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
    <section className="bg-background py-16 sm:py-24 lg:py-32 overflow-hidden">
      <MarketingContainer>
        <div className="flex flex-col gap-24 sm:gap-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 !== 0;
            return (
              <div
                key={feature.id}
                id={feature.id}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 scroll-mt-24"
              >
                <div
                  className={cn(
                    "order-2 lg:order-none",
                    isReversed ? "lg:order-2" : "lg:order-1",
                  )}
                >
                  <h2 className="omnih-h2 text-3xl sm:text-4xl font-bold text-foreground">
                    {feature.title}
                  </h2>
                  <div className="omnih-body mt-6 text-[17px] sm:text-[18px] leading-relaxed text-muted-foreground space-y-6">
                    {feature.description}
                  </div>
                </div>

                <div
                  className={cn(
                    "order-1 lg:order-none relative mx-auto w-full max-w-xl lg:max-w-none",
                    isReversed ? "lg:order-1" : "lg:order-2",
                  )}
                >
                  <div className="relative w-full overflow-hidden aspect-[4/3] rounded-[1.75rem] shadow-md border border-border/40 bg-muted/30">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={cn(
                        feature.isMockup
                          ? "object-contain object-center drop-shadow-xl p-4 lg:p-8"
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
