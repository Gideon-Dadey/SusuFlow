import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MarketingContainer } from "./marketing-container";

export function SusuManagementSection() {
  return (
    <section className="bg-background py-12 lg:py-20 border-t border-border/40">
      <MarketingContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Left Column: Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-[1.75rem] overflow-hidden shadow-md border border-border/40 bg-muted/30 aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src="/images/home/relaxed-manager.png"
                alt="Relaxed Susu Manager"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
            <span className="text-[17px] font-medium tracking-wide text-muted-foreground block">
              Spend & Susu Management
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
              Become the world’s most relaxed expense control freak.
            </h2>

            <p className="text-[17px] text-muted-foreground leading-relaxed text-pretty max-w-xl">
              Earn unlimited cashback with our Full Suite package. Access 30+
              currency configurations, issue virtual cards to your staff
              globally and manage team budgets with greater transparency and
              control.
            </p>

            <div className="pt-2">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-[17px] sm:text-[17px] font-semibold text-[#0066cc] hover:text-[#0052a3] transition-colors group"
              >
                <span>Spend Management</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
