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
            <h2 className="omnih-h2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-8">
              {title}
            </h2>
          )}
          <div className="omnih-body text-[17px] sm:text-[18px] leading-relaxed text-slate-600 dark:text-slate-400 space-y-6">
            {children}
          </div>
        </div>
      </MarketingContainer>
    </div>
  );
}
