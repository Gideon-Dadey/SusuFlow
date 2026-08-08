import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";
import { SectionEyebrow } from "./section-eyebrow";

export function PageHero({
  title,
  description,
  eyebrow,
  align = "center",
}: {
  title: string;
  description: string;
  eyebrow?: string;
  align?: "center" | "left";
}) {
  return (
    <section className="bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div
          className={cn(
            "max-w-3xl animate-fade-in",
            align === "center" ? "mx-auto text-center" : "text-left",
          )}
        >
          {eyebrow ? (
            <SectionEyebrow className={align === "center" ? "text-center" : ""}>
              {eyebrow}
            </SectionEyebrow>
          ) : null}
          <h1 className="afrusan-hero-title text-balance !text-4xl sm:!text-5xl lg:!text-[3.5rem]">
            {title}
          </h1>
          <p className="afrusan-body mt-5 text-balance">{description}</p>
        </div>
      </MarketingContainer>
    </section>
  );
}
