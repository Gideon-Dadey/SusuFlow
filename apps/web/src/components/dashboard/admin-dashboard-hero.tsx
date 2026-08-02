"use client";

export interface AdminDashboardHeroProps {
  greeting?: string;
  title: string;
  subtitle: string;
  highlight1Label?: string;
  highlight1Value?: string;
  highlight2Label?: string;
  highlight2Value?: string;
}

export function AdminDashboardHero({
  greeting = "Good day 👋",
  title,
  subtitle,
  highlight1Label,
  highlight1Value,
  highlight2Label,
  highlight2Value,
}: AdminDashboardHeroProps) {
  return (
    <section className="overflow-hidden rounded-none border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 shadow-sm">
      <div className="flex flex-row items-stretch">
        {/* Left Welcome Area */}
        <div className="min-w-0 flex-1 p-3 sm:p-6 lg:p-7">
          <p className="text-[11px] font-medium text-muted-foreground sm:text-sm">
            {greeting}
          </p>
          <h1 className="mt-0.5 text-sm font-bold leading-snug tracking-tight text-foreground sm:mt-1 sm:text-2xl lg:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:mt-2 sm:text-base">
            {subtitle}
          </p>
        </div>

        {/* Right Metric Highlight Panel */}
        {(highlight1Value || highlight2Value) && (
          <div className="flex w-[min(42%,10rem)] shrink-0 flex-col justify-center gap-2 border-l border-border/60 bg-muted/20 p-2.5 sm:w-[min(100%,280px)] sm:gap-4 sm:p-6 lg:p-7">
            {highlight1Value && (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {highlight1Label ?? "Primary Metric"}
                </p>
                <p className="mt-0.5 text-sm font-bold tabular-nums text-foreground sm:text-2xl lg:text-3xl">
                  {highlight1Value}
                </p>
              </div>
            )}
            {highlight2Value && (
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {highlight2Label ?? "Secondary Metric"}
                </p>
                <p className="mt-0.5 text-xs font-bold tabular-nums text-foreground sm:text-xl lg:text-2xl">
                  {highlight2Value}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
