"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Zap,
} from "lucide-react";
import { SusuFlowIconMark } from "@/components/marketing/brand-logo";
import { MarketingContainer } from "./marketing-container";
import { cn } from "@/lib/utils";

export function PlatformOverviewSection() {
  return (
    <section className="bg-[#f4f6f8] dark:bg-background">
      <MarketingContainer className="pt-10 pb-12 sm:pt-16 sm:pb-16 lg:py-24">
        <div className="flex flex-col gap-8 sm:gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div className="order-2 min-w-0 text-left lg:order-1">
            <h2 className="text-balance text-3xl font-black leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              Control everything.
              <br />
              See everything.
              <br />
              <span className="text-[#0056d2] dark:text-[#38bdf8]">
                All in one place.
              </span>
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground lg:mt-6">
              Forget juggling paper books, WhatsApp receipts, and collector
              disputes. Run field collections, instant MoMo gateway
              verifications, and double-entry ledger audits from one unified
              platform.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 max-w-lg">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <Zap className="h-4 w-4 text-[#0056d2] dark:text-sky-400 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Instant Settlement
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <ShieldCheck className="h-4 w-4 text-[#0056d2] dark:text-sky-400 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  100% Cashless Audit
                </span>
              </div>
            </div>

            <Link
              href="/how-it-works"
              className="mt-8 inline-flex items-center gap-2 text-base font-bold text-[#0056d2] dark:text-sky-400 transition-colors hover:opacity-80"
            >
              <span>Explore the platform</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={cn(
              "relative order-1 mx-auto w-full max-w-[36rem] lg:order-2 lg:max-w-none lg:justify-self-end select-none",
            )}
          >
            {/* Background Glow */}
            <div
              className="pointer-events-none absolute -left-4 top-1/2 hidden h-3/4 w-3/4 -translate-y-1/2 rounded-full bg-[#0056d2]/10 blur-3xl lg:block"
              aria-hidden
            />

            {/* Native Enterprise Platform Overview UI Card */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_24px_50px_rgba(0,86,210,0.12)] dark:border-white/10 dark:bg-[#0c101d]">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <SusuFlowIconMark className="h-6 w-6" />
                  <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                    Credo<span className="text-[#0056d2]">.</span> Enterprise
                    Suite
                  </span>
                </div>
                <span className="rounded-md bg-[#0056d2]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#0056d2] dark:text-sky-400">
                  BoG Act 987 Certified
                </span>
              </div>

              {/* Module Cards Grid */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0056d2] text-white font-bold">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Multi-Branch Susu Enterprise
                      </p>
                      <p className="text-[11px] text-slate-500">
                        14 Branches • 42 Field Collectors Active
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-white/5 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white font-bold">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Spreadsheet Studio & AI Ledger
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Double-Entry Audit Log • Zero Discrepancy
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#0056d2] dark:text-sky-400">
                    Synchronized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
