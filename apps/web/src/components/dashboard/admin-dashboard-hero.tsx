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
    <section className="company-overview-hero">
      <div>
        <p className="company-meta">{greeting}</p>
        <h1 className="company-hero-figure mt-1">{title}</h1>
        <p className="company-meta mt-1">{subtitle}</p>
      </div>
      {(highlight1Value || highlight2Value) && (
        <div className="flex shrink-0 items-start gap-8">
          {highlight1Value ? (
            <div>
              <p className="company-meta">{highlight1Label ?? "Primary"}</p>
              <p className="company-hero-figure mt-1 text-[1.35rem]">
                {highlight1Value}
              </p>
            </div>
          ) : null}
          {highlight2Value ? (
            <div>
              <p className="company-meta">{highlight2Label ?? "Secondary"}</p>
              <p className="company-hero-figure mt-1 text-[1.35rem]">
                {highlight2Value}
              </p>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
