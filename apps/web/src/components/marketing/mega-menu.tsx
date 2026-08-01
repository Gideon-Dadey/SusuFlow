"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faMobileScreenButton,
  faUsers,
  faBuilding,
  faShieldHalved,
  faChartLine,
  faScaleBalanced,
  faLayerGroup,
  faFileLines,
  faBuildingColumns,
  faUserCheck,
  faCalculator,
  faCircleCheck,
  faAward,
  faQrcode,
  faLock,
  faLandmark,
  faArrowRight,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { BRAND_HERO_SHOWCASE } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";

export interface MegaMenuItem {
  title: string;
  description: string;
  href: string;
  icon: IconDefinition;
}

export interface MegaMenuCategory {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuConfig {
  label: string;
  href: string;
  categories: MegaMenuCategory[];
  promo: {
    badge: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    imageSrc?: string;
  };
}

export const PRODUCT_MEGA_MENU: MegaMenuConfig = {
  label: "Product",
  href: "/how-it-works",
  categories: [
    {
      title: "Accounts, Payments & Cards",
      items: [
        {
          title: "Digital Susu Accounts",
          description:
            "Collect, hold and manage daily Susu savings with 100% gateway verification",
          href: "/how-it-works#susu-accounts",
          icon: faWallet,
        },
        {
          title: "Instant MoMo Payouts",
          description:
            "Automated payouts to MTN, Telecel, and AT wallets with dual sign-off",
          href: "/how-it-works#momo-payouts",
          icon: faMobileScreenButton,
        },
        {
          title: "Field Collector App",
          description:
            "Mobile app for market collectors with instant digital receipts",
          href: "/how-it-works#collector-app",
          icon: faUsers,
        },
      ],
    },
    {
      title: "Manage & Control",
      items: [
        {
          title: "Multi-Branch Management",
          description:
            "Manage multiple market branches, staff roles, and collection targets",
          href: "/how-it-works#branch-management",
          icon: faBuilding,
        },
        {
          title: "Control Hub",
          description:
            "Approvals, multi-level sign-offs, budgets, workflows & user rights",
          href: "/how-it-works#control-hub",
          icon: faShieldHalved,
        },
        {
          title: "Savings & Loan Plans",
          description:
            "Flexible daily Susu, fixed goal savings, and loan packages",
          href: "/how-it-works#savings-plans",
          icon: faChartLine,
        },
      ],
    },
    {
      title: "Platform Capabilities",
      items: [
        {
          title: "Automated Reconciliation",
          description:
            "Real-time double-entry ledger reconciliation against MoMo gateways",
          href: "/how-it-works#reconciliation",
          icon: faScaleBalanced,
        },
        {
          title: "Gateway Integrations",
          description:
            "MTN MoMo, Hubtel, and automated SMS gateway connectivity",
          href: "/how-it-works#integrations",
          icon: faLayerGroup,
        },
        {
          title: "Live Ledger & Reports",
          description:
            "Exportable trial balances, audit logs, and management balance sheets",
          href: "/how-it-works#reporting",
          icon: faFileLines,
        },
      ],
    },
  ],
  promo: {
    badge: "Full Suite",
    title: "Become the world’s most relaxed expense control freak.",
    description:
      "Earn unlimited cashback with our Full Suite package. Access 30+ currency configurations, issue virtual cards to your staff globally and manage team budgets with greater transparency and control.",
    ctaLabel: "Get Started Free",
    ctaHref: "/register",
    imageSrc: "/marketing/pro.webp",
  },
};

export const WHY_SUSUFLOW_MEGA_MENU: MegaMenuConfig = {
  label: "Why SusuFlow",
  href: "/about",
  categories: [
    {
      title: "Solutions For",
      items: [
        {
          title: "Susu Companies & MFIs",
          description:
            "Purpose-built software for Ghanaian microfinance operators to scale safely",
          href: "/about#solutions-mfis",
          icon: faBuildingColumns,
        },
        {
          title: "Field Collectors",
          description:
            "Empower market agents with mobile collection tools & live tracking",
          href: "/about#solutions-collectors",
          icon: faUserCheck,
        },
        {
          title: "Accountants & Management",
          description:
            "Reconcile books in seconds with double-entry ledgers & audit trails",
          href: "/about#solutions-accountants",
          icon: faCalculator,
        },
      ],
    },
    {
      title: "Case Studies & Impact",
      items: [
        {
          title: "Zero Notebook Fraud",
          description:
            "How partner MFIs eliminated ledger disputes & missing cash in 30 days",
          href: "/about#case-studies",
          icon: faShieldHalved,
        },
        {
          title: "100% Gateway Verification",
          description:
            "Guarantee every deposit hits the bank before crediting client balances",
          href: "/about#verification",
          icon: faCircleCheck,
        },
        {
          title: "Market Scale Story",
          description:
            "Scaling from 5 to 50+ collectors across Kumasi & Accra markets",
          href: "/about#scale-story",
          icon: faAward,
        },
      ],
    },
    {
      title: "Use Cases & Trust",
      items: [
        {
          title: "Cashless Market Collections",
          description:
            "Direct Mobile Money wallet prompts right at the trader stall",
          href: "/about#use-cases",
          icon: faQrcode,
        },
        {
          title: "Role-Based Approvals",
          description:
            "Enforce manager sign-off on withdrawals and plan modifications",
          href: "/about#security",
          icon: faLock,
        },
        {
          title: "Bank-Grade Accounting",
          description:
            "Complete transparency for auditors, partners, and regulators",
          href: "/about#compliance",
          icon: faLandmark,
        },
      ],
    },
  ],
  promo: {
    badge: "Trust & Compliance",
    title: "Empowering Ghanaian Susu with Modern Fintech.",
    description:
      "Built on Ghana's Susu heritage with double-entry security and bank-grade encryption.",
    ctaLabel: "Read Our Story",
    ctaHref: "/about",
    imageSrc: "/images/home/solutions-in-action.png",
  },
};

interface MegaDropdownProps {
  config: MegaMenuConfig;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
}

export function MegaDropdown({
  config,
  isOpen,
  onClose,
  onMouseEnter,
}: MegaDropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 top-[4.5rem] z-[250] bg-slate-900/25 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed inset-x-0 top-[4.5rem] z-[300] border-b border-slate-200/90 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[#09090b] dark:shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onClose}
      >
        <MarketingContainer className="py-8 lg:py-10">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-12">
            <div className="lg:col-span-9 flex flex-col gap-10">
              {config.categories.map((category) => (
                <div key={category.title} className="w-full">
                  <h3 className="mb-6 text-[18px] font-bold text-slate-900 dark:text-white">
                    {category.title}
                  </h3>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {category.items.map((item) => (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={onClose}
                        className="group flex items-start gap-4 transition-colors"
                      >
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50/50 text-slate-500 transition-colors group-hover:border-[#0066cc]/30 group-hover:bg-[#0066cc]/5 group-hover:text-[#0066cc] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:group-hover:border-[#38bdf8]/30 dark:group-hover:bg-[#38bdf8]/10 dark:group-hover:text-[#38bdf8]">
                          <FontAwesomeIcon
                            icon={item.icon}
                            className="h-[16px] w-[16px]"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold text-slate-900 transition-colors group-hover:text-[#0066cc] dark:text-white dark:group-hover:text-[#38bdf8]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-[15px] leading-relaxed text-slate-900 dark:text-white pr-4">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-[0.3rem] border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-[#141417]">
                {config.promo.imageSrc && (
                  <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-900">
                    <Image
                      src={config.promo.imageSrc}
                      alt={config.promo.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                  </div>
                )}

                <div className="space-y-3 p-5">
                  <span className="inline-flex items-center rounded-full bg-[#0066cc]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0066cc] dark:bg-[#38bdf8]/10 dark:text-[#38bdf8]">
                    {config.promo.badge}
                  </span>
                  <h4 className="text-[15px] font-bold leading-snug text-slate-900 dark:text-white">
                    {config.promo.title}
                  </h4>
                  <p className="text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                    {config.promo.description}
                  </p>
                  <Link
                    href={config.promo.ctaHref}
                    onClick={onClose}
                    className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0066cc] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052a3]"
                  >
                    <span>{config.promo.ctaLabel}</span>
                    <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </MarketingContainer>
      </div>
    </>,
    document.body,
  );
}
