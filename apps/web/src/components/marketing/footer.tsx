"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  MapPin,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  MessageSquare,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE, SUPPORT_EMAIL } from "@/lib/marketing-data";
import { BrandLockup } from "@/components/marketing/brand-logo";
import { MarketingContainer } from "./marketing-container";

export function MarketingFooter() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#08080a] text-slate-100">
      <MarketingContainer className="relative z-10 pt-16 pb-8">
        {/* Top Section: Demo & Newsletter Bar */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-white/10">
          <div className="lg:col-span-6 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Digitize your Susu enterprise with confidence
            </h2>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
              Empowering modern Ghanaian microfinance institutions and susu
              companies with gateway-confirmed deposits and 100% cashless audit
              logs.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 p-4 text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    Thank you for subscribing!
                  </p>
                  <p className="text-xs text-emerald-400/80">
                    We&apos;ve dispatched product documentation and compliance
                    guides to your email.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your work email address..."
                    required
                    className="w-full h-12 rounded-2xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Request Demo</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Grid: Domain Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Office Information */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center">
              <BrandLockup onDark wordmarkClassName="text-2xl" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {APP_TAGLINE}
            </p>
            <p className="text-xs text-slate-400/80 leading-relaxed">
              Designed for Ghanaian microfinance enterprises, cashless field
              agents, and market traders with instant gateway deposit
              verification.
            </p>

            {/* Direct Contact Links */}
            <div className="space-y-2.5 pt-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-3 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-400">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                {SUPPORT_EMAIL}
              </a>
              <a
                href="https://wa.me/233500000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-xs text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                +233 (0) 50 000 0000 (WhatsApp Support)
              </a>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/[0.06] text-emerald-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                Accra Financial Centre, Ridge, Accra - Ghana
              </div>
            </div>
          </div>

          {/* Column 2: Product Suite */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-emerald-500/30 pb-2 inline-block">
              Product Suite
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/staff/calculator"
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Financial Suite</span>
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    NEW
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/staff/excel"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Spreadsheet Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/staff/analytics"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  AI Credit Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-emerald-500/30 pb-2 inline-block">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Contact Sales
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Staff & Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Regulatory Compliance */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-emerald-500/30 pb-2 inline-block">
              Regulatory & Compliance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compliant with Bank of Ghana Payment Systems & Services Act, 2019
              (Act 987) and Data Protection Act, 2012 (Act 843).
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <Building2 className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-slate-300">
                  BoG Act 987
                </p>
                <p className="text-[9px] text-slate-500">Licensed Standard</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
                <Lock className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-slate-300">
                  DPC Act 843
                </p>
                <p className="text-[9px] text-slate-500">AES-256 Encrypted</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status & Copyright Row */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-medium">
              All Systems Operational
            </span>
            <span className="text-slate-600">|</span>
            <span>99.98% Uptime SLA</span>
          </div>

          <div className="text-center">
            © {year} {APP_NAME} Inc. All rights reserved. Built for Ghanaian
            Financial Enterprise.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/233500000000"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/Gideon-Dadey/SusuFlow"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* GIANT ORGANIC BRAND WORDMARK BANNER (Hims-inspired luxury brand seal) */}
        <div className="relative mt-12 pt-6 border-t border-white/10 overflow-hidden select-none pointer-events-none text-center">
          <span className="block text-[13vw] sm:text-[15vw] font-extrabold tracking-tighter leading-none text-white/[0.06] uppercase font-sans">
            SusuFlow
          </span>
        </div>
      </MarketingContainer>
    </footer>
  );
}
