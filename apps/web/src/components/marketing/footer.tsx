"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
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

  return (
    <footer className="relative overflow-hidden bg-white dark:bg-background text-slate-900 dark:text-slate-100 border-t border-border/60">
      <MarketingContainer className="relative z-10 pt-16 pb-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Brand Information */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <BrandLockup wordmarkClassName="text-2xl" />
            </Link>
            <h3 className="text-[17px] font-bold text-slate-900 text-foreground leading-snug">
              Enterprise Susu &amp; Digital Savings Platform with verified
              deposits.
            </h3>
            <p className="text-[17px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Designed for Ghanaian microfinance enterprises, cashless field
              agents, and market traders with instant gateway deposit
              verification.
            </p>
          </div>

          {/* 2-Column Mobile Grid for PRODUCT SUITE and COMPANY */}
          <div className="grid grid-cols-2 gap-6 col-span-1 lg:col-span-5 lg:grid-cols-5">
            {/* Column 2: Product Suite */}
            <div className="lg:col-span-3 space-y-4">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider inline-block">
                PRODUCT SUITE
              </h3>
              <ul className="space-y-3.5 text-[17px]">
                <li>
                  <Link
                    href="/how-it-works"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Pricing Plans
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff/calculator"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Financial Suite</span>
                    <span className="rounded bg-[#0066cc]/10 dark:bg-[#0066cc]/20 px-1.5 py-0.5 text-[11px] font-bold text-[#0066cc] dark:text-[#38bdf8]">
                      NEW
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff/excel"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Spreadsheet Studio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/staff/analytics"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    AI Credit Insights
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider inline-block">
                COMPANY
              </h3>
              <ul className="space-y-3.5 text-[17px]">
                <li>
                  <Link
                    href="/about"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Contact Sales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Customer Portal
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                  >
                    Staff &amp; Admin Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="hidden sm:block lg:col-span-3 space-y-4">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider inline-block">
              CONTACT US
            </h3>
            <ul className="space-y-3.5 text-[17px]">
              <li>
                <a
                  href="mailto:gideondadey@gmail.com"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Email
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/233551550530"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  Office Location
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Status & Copyright Bar */}
        <div className="mt-14 flex flex-col md:flex-row items-center justify-between gap-4 text-[16px] text-slate-600 dark:text-slate-400 border-t border-border/60 pt-8">
          <div className="text-center">
            © {year} {APP_NAME} Inc. All rights reserved. Built for Ghanaian
            Financial Enterprise.
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-5">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://wa.me/233551550530"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/Gideon-Dadey/SusuFlow"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* GIANT BRAND WORDMARK BANNER */}
        <div className="relative mt-12 overflow-hidden select-none pointer-events-none text-center">
          <span className="block text-[13vw] sm:text-[15vw] font-extrabold tracking-tighter leading-none text-slate-200/50 text-foreground/[0.04] uppercase font-sans">
            SusuFlow
          </span>
        </div>
      </MarketingContainer>
    </footer>
  );
}
