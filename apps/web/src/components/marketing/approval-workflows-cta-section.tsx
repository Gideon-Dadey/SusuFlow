import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "./marketing-container";

export function ApprovalWorkflowsCtaSection() {
  return (
    <section className="bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="w-full rounded-none bg-[#1a1a1a] px-6 py-12 text-center sm:px-8 sm:py-14 lg:px-10 lg:py-16 xl:px-12 2xl:px-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-white/70">
              Deposit &amp; payout workflows
            </p>

            <h2 className="mt-4 text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.15rem]">
              Fast, secure approvals for every susu contribution, built for
              Ghana.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-white/75 sm:text-base">
              Route MoMo deposits through gateway verification, enforce
              maker-checker payout rules, and keep a full audit trail with
              automated approvals for collectors, staff payouts, commission
              releases, and role-based access controls.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/contact?intent=demo"
                className="sm:max-w-[11rem] sm:flex-1"
              >
                <Button
                  size="lg"
                  className="h-12 w-full rounded-none text-[15px] font-bold shadow-[0_6px_20px_rgba(34,197,94,0.35)]"
                >
                  Susu companies
                </Button>
              </Link>
              <Link href="/register" className="sm:max-w-[11rem] sm:flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-none border-white/35 bg-transparent text-[15px] font-bold text-white hover:bg-white/10 hover:text-white"
                >
                  Join as saver
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
