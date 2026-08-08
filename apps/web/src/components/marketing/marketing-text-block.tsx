import { MarketingContainer } from "./marketing-container";

export interface MarketingTextBlockProps {
  title?: string;
  children: React.ReactNode;
}

export function MarketingTextBlock({
  title,
  children,
}: MarketingTextBlockProps) {
  return (
    <section className="afrusan-section bg-background">
      <MarketingContainer>
        <div className="mx-auto max-w-3xl">
          {title ? (
            <h2 className="afrusan-section-title mb-8 text-balance">{title}</h2>
          ) : null}
          <div className="afrusan-body space-y-6">{children}</div>
        </div>
      </MarketingContainer>
    </section>
  );
}
