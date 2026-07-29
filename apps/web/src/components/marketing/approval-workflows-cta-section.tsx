import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "./marketing-container";

export function ApprovalWorkflowsCtaSection() {
  return (
    <section className="bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="w-full rounded-2xl bg-[#08080a] px-6 py-12 text-center sm:px-8 sm:py-14 lg:px-10 lg:py-16 xl:px-12 2xl:px-14 border border-white/10 shadow-2xl">
          <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
            <span className="inline-block rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-400 uppercase tracking-wider">
              Deposit &amp; payout workflows
            </span>

            <h2 className="mt-5 text-balance text-2xl font-black leading-tight tracking-tight text-white text-center sm:text-3xl lg:text-[2.15rem]">
              Fast, secure approvals for every susu contribution, built for
              Ghana.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-slate-300 text-center sm:text-base">
              Route MoMo deposits through gateway verification, enforce
              maker-checker payout rules, and keep a full audit trail with
              automated approvals for collectors, staff payouts, commission
              releases, and role-based access controls.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 w-full sm:w-auto sm:flex-row">
              <Link
                href="/contact?intent=demo"
                className="w-full sm:w-auto sm:min-w-[11rem]"
              >
                <Button
                  size="lg"
                  className="h-12 w-full rounded-[0.2rem] bg-[#0056d2] hover:bg-[#0043aa] text-white text-[15px] font-bold shadow-lg shadow-blue-500/25 transition-all duration-200"
                >
                  Susu companies
                </Button>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto sm:min-w-[11rem]"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-[0.2rem] border-white/30 bg-transparent text-[15px] font-bold text-white hover:bg-white/10 hover:text-white transition-all duration-200"
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
