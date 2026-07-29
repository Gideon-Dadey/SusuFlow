"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  Github,
  Linkedin,
  Twitter,
  MessageSquare,
} from "lucide-react";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/marketing-data";
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
    <footer className="relative overflow-hidden bg-[#08080a] text-slate-100 border-t border-white/10">
      <MarketingContainer className="relative z-10 pt-16 pb-8">
        {/* Top Section: Demo & Newsletter Bar */}
        <div className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-white/10 pb-12">
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
              <div className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/15 p-4 text-sky-300">
                <CheckCircle2 className="h-5 w-5 text-sky-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">
                    Thank you for subscribing!
                  </p>
                  <p className="text-xs text-sky-400/80">
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
                    className="w-full h-12 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-white placeholder-slate-500 focus:border-[#0066cc] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/30 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center justify-center shrink-0"
                >
                  <span>Request Demo</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand Information */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <BrandLockup onDark wordmarkClassName="text-2xl" />
            </Link>
            <h3 className="text-sm font-bold text-white leading-snug">
              Enterprise Susu &amp; Digital Savings Platform with verified
              deposits.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for Ghanaian microfinance enterprises, cashless field
              agents, and market traders with instant gateway deposit
              verification.
            </p>
          </div>

          {/* 2-Column Mobile Grid for PRODUCT SUITE and COMPANY */}
          <div className="grid grid-cols-2 gap-6 col-span-1 lg:col-span-5 lg:grid-cols-5">
            {/* Column 2: Product Suite */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest inline-block">
                PRODUCT SUITE
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff/calculator"
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Financial Suite</span>
                    <span className="rounded bg-[#0066cc]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#38bdf8]">
                      NEW
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff/excel"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Spreadsheet Studio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff/analytics"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    AI Credit Insights
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest inline-block">
                COMPANY
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Contact Sales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Customer Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Staff &amp; Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="hidden sm:block lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest inline-block">
              CONTACT US
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:gideondadey@gmail.com"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/233551550530"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Office Location
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Status & Copyright Bar */}
        <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-white/10 pt-8">
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
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://wa.me/233551550530"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/Gideon-Dadey/SusuFlow"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* GIANT BRAND WORDMARK BANNER */}
        <div className="relative mt-12 overflow-hidden select-none pointer-events-none text-center">
          <span className="block text-[13vw] sm:text-[15vw] font-extrabold tracking-tighter leading-none text-white/[0.06] uppercase font-sans">
            Credo
          </span>
        </div>
      </MarketingContainer>
    </footer>
  );
}
