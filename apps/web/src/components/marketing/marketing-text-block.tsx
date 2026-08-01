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
    <div className="bg-background py-16 sm:py-24">
      <MarketingContainer>
        <div className="mx-auto max-w-3xl">
          {title && (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
              {title}
            </h2>
          )}
          <div className="text-[17px] leading-8 text-slate-600 space-y-6">
            {children}
          </div>
        </div>
      </MarketingContainer>
    </div>
  );
}
