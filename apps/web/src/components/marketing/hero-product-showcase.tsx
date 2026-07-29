"use client";

import {
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  Smartphone,
  ArrowUpRight,
} from "lucide-react";
import { SusuFlowIconMark } from "@/components/marketing/brand-logo";
import { cn } from "@/lib/utils";

export function HeroProductShowcase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "hero-showcase relative mx-auto w-full max-w-[36rem] lg:max-w-none select-none",
        className,
      )}
    >
      {/* Background Soft Glow */}
      <div
        className="pointer-events-none absolute -right-6 top-8 hidden h-[80%] w-[90%] rounded-full bg-gradient-to-br from-[#0056d2]/15 via-sky-400/10 to-transparent blur-3xl lg:block"
        aria-hidden
      />

      {/* Main Tablet / Desktop Dashboard Frame */}
      <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-[0_24px_50px_rgba(0,86,210,0.12)] dark:border-white/10 dark:bg-[#0c101d]">
        {/* Window Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="ml-2 flex items-center gap-2">
              <SusuFlowIconMark className="h-5 w-5" />
              <span className="text-xs font-black tracking-tight text-slate-800 dark:text-white">
                Credo<span className="text-[#0056d2]">.</span> Admin Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-[#0056d2] dark:text-sky-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0056d2]" />
            </span>
            <span>Gateway Connected</span>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Daily MoMo Deposits
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-[#0056d2] dark:text-sky-400" />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              GH₵ 48,520
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              +18.4% vs yesterday
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Verified Gateway
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#0056d2] dark:text-sky-400" />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              100%
            </p>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              0 Cash Fraud
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-white/5 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Active Savers
              </span>
              <Users className="h-3.5 w-3.5 text-[#0056d2] dark:text-sky-400" />
            </div>
            <p className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              1,240
            </p>
            <span className="text-[10px] font-semibold text-[#0056d2] dark:text-sky-400">
              Across 14 Groups
            </span>
          </div>
        </div>

        {/* Live Transaction Feed Table */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-white overflow-hidden dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-white/5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Live Gateway Settlement Feed
            </span>
            <span className="text-[11px] font-semibold text-[#0056d2] dark:text-sky-400">
              Real-Time
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-[#0056d2] dark:text-sky-400 font-bold text-[10px]">
                  MTN
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Kofi Mensah (Adum Susu)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Ref: HUB-8849201 • MoMo Deposit
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  +GH₵ 250.00
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Confirmed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-[#0056d2] dark:text-sky-400 font-bold text-[10px]">
                  MTN
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    Abena Osei (Makola Market)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Ref: HUB-8849202 • Daily Contribution
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-900 dark:text-white">
                  +GH₵ 500.00
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Mobile App Overlay Badge */}
      <div className="absolute -bottom-6 -right-2 sm:-right-4 w-[13.5rem] rounded-2xl border border-slate-200/80 bg-slate-900 p-3.5 text-white shadow-2xl dark:border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[10px] font-bold text-slate-300">
              Collector Mobile App
            </span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div className="mt-2.5 space-y-1">
          <p className="text-[10px] text-slate-400">Cashless Prompt Sent</p>
          <p className="text-sm font-extrabold text-white">GH₵ 100.00</p>
          <div className="flex items-center gap-1.5 pt-1 text-[9px] font-bold text-sky-300">
            <CheckCircle2 className="h-3 w-3 text-sky-400" /> Instant Receipt ID
          </div>
        </div>
      </div>
    </div>
  );
}
