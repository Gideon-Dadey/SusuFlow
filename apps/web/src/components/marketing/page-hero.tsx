import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";

export function PageHero({
  title,
  description,
  align = "center",
}: {
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <section className="page-hero-offset relative overflow-hidden border-b border-border bg-brand-dark dark:bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(0,102,204,0.18),transparent)]"
        aria-hidden
      />
      <MarketingContainer className="relative pb-2">
        <div
          className={cn(
            "max-w-3xl animate-fade-in py-4",
            align === "center" ? "mx-auto text-center" : "text-left",
          )}
        >
          <h1 className="sr-hero-title text-balance text-white dark:text-heading">
            {title}
          </h1>
          <p className="sr-hero-copy mt-4 font-normal leading-relaxed text-slate-300 dark:text-muted-foreground sm:mt-6">
            {description}
          </p>
        </div>
      </MarketingContainer>
    </section>
  );
}
