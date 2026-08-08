import { MarketingFooter } from "@/components/marketing/footer";
import { FooterCtaSection } from "@/components/marketing/footer-cta-section";
import { MarketingNavbar } from "@/components/marketing/navbar";
import { MarketingScrollToTop } from "@/components/marketing/marketing-scroll-to-top";
import { ThemeToggleRail } from "@/components/theme-toggle-rail";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingScrollToTop />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-secondary focus:px-4 focus:py-2 focus:text-secondary-foreground"
      >
        Skip to content
      </a>

      <div className="marketing-canvas flex min-h-screen flex-col">
        <MarketingNavbar />
        <main id="main-content" className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <FooterCtaSection />
        <MarketingFooter />
      </div>
      <ThemeToggleRail />
    </>
  );
}
