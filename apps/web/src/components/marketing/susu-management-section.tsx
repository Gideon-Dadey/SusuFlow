import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { MarketingContainer } from "./marketing-container";
import { Button } from "@/components/ui/button";

export function SusuManagementSection() {
  return (
    <section className="bg-background py-12 lg:py-20 border-t border-border/40">
      <MarketingContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Left Column: Image with Overlaying Floating Budget Card */}
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

            {/* Floating Glassmorphic Budget / Savings Control UI Overlay */}
            <div className="absolute top-4 sm:top-8 left-4 sm:left-8 w-[240px] sm:w-[280px] p-4 sm:p-5 bg-card/95 backdrop-blur-md rounded-2xl border border-border/80 shadow-xl transition-all hover:scale-[1.02] duration-300">
              <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                <div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground block">
                    Budget period
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    Monthly
                  </span>
                </div>
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>

              <div className="border-b border-border/60 pb-3 mb-3">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground block">
                  Monthly limit
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-foreground">GHS</span>
                  <span className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                    50,000.00
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground block mb-1.5">
                  Budget members
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    5 added
                  </span>
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-blue-500 text-[10px] font-bold text-white flex items-center justify-center">
                      AD
                    </div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                      KW
                    </div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-background bg-purple-500 text-[10px] font-bold text-white flex items-center justify-center">
                      +3
                    </div>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full h-9 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white text-xs font-semibold"
              >
                Create budget
              </Button>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
            <span className="text-sm font-medium tracking-wide text-muted-foreground block">
              Spend & Susu Management
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-foreground leading-[1.15] tracking-tight">
              Become the world’s most relaxed expense control freak.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-xl">
              Earn unlimited cashback with our Full Suite package. Access 30+
              currency configurations, issue virtual cards to your staff
              globally and manage team budgets with greater transparency and
              control.
            </p>

            <div className="pt-2">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#0066cc] hover:text-[#0052a3] transition-colors group"
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
