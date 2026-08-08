import Link from "next/link";
import { APP_NAME } from "@/lib/marketing-data";
import { MarketingContainer } from "./marketing-container";

export function FooterCtaSection() {
  return (
    <section className="bg-[#010517] text-white">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-geist text-3xl sm:text-4xl lg:text-[2.75rem] font-medium leading-tight tracking-tight">
            {APP_NAME}
            <br />
            <span className="text-white/80">
              Digital susu that reaches every member.
            </span>
          </h2>
          <Link
            href="/contact"
            className="afrusan-cta-pill mt-8 bg-white text-[#010517] hover:bg-white/90"
          >
            Contact us
          </Link>
        </div>
      </MarketingContainer>
    </section>
  );
}
