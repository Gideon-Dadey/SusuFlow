"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Wallet,
  Smartphone,
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  Scale,
  Layers,
  FileText,
  Building,
  UserCheck,
  Calculator,
  ShieldAlert,
  CheckCircle2,
  Award,
  QrCode,
  Lock,
  Landmark,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "./marketing-container";

export interface MegaMenuItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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
          icon: Wallet,
        },
        {
          title: "Instant MoMo Payouts",
          description:
            "Automated payouts to MTN, Telecel, and AT wallets with dual sign-off",
          href: "/how-it-works#momo-payouts",
          icon: Smartphone,
        },
        {
          title: "Field Collector App",
          description:
            "Mobile app for market collectors with instant digital receipts",
          href: "/how-it-works#collector-app",
          icon: Users,
        },
        {
          title: "Multi-Branch Management",
          description:
            "Manage multiple market branches, staff roles, and collection targets",
          href: "/how-it-works#branch-management",
          icon: Building2,
        },
      ],
    },
    {
      title: "Manage & Control",
      items: [
        {
          title: "Control Hub",
          description:
            "Approvals, multi-level sign-offs, budgets, workflows & user rights",
          href: "/how-it-works#control-hub",
          icon: ShieldCheck,
        },
        {
          title: "Savings & Loan Plans",
          description:
            "Flexible daily Susu, fixed goal savings, and loan packages",
          href: "/how-it-works#savings-plans",
          icon: TrendingUp,
        },
        {
          title: "Automated Reconciliation",
          description:
            "Real-time double-entry ledger reconciliation against MoMo gateways",
          href: "/how-it-works#reconciliation",
          icon: Scale,
        },
      ],
    },
    {
      title: "Platform Capabilities",
      items: [
        {
          title: "Gateway Integrations",
          description:
            "MTN MoMo, Hubtel, and automated SMS gateway connectivity",
          href: "/how-it-works#integrations",
          icon: Layers,
        },
        {
          title: "Live Ledger & Reports",
          description:
            "Exportable trial balances, audit logs, and management balance sheets",
          href: "/how-it-works#reporting",
          icon: FileText,
        },
      ],
    },
  ],
  promo: {
    badge: "Enterprise Susu Suite",
    title: "Control spend & collections with SusuFlow Digital Platform.",
    description:
      "100% cashless audit trails, instant MoMo verification, and real-time field collector tracking.",
    ctaLabel: "Get Started Free",
    ctaHref: "/register",
    imageSrc: "/images/home/relaxed-manager.png",
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
          icon: Building,
        },
        {
          title: "Field Collectors",
          description:
            "Empower market agents with mobile collection tools & live tracking",
          href: "/about#solutions-collectors",
          icon: UserCheck,
        },
        {
          title: "Accountants & Management",
          description:
            "Reconcile books in seconds with double-entry ledgers & audit trails",
          href: "/about#solutions-accountants",
          icon: Calculator,
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
          icon: ShieldAlert,
        },
        {
          title: "100% Gateway Verification",
          description:
            "Guarantee every deposit hits the bank before crediting client balances",
          href: "/about#verification",
          icon: CheckCircle2,
        },
        {
          title: "Market Scale Story",
          description:
            "Scaling from 5 to 50+ collectors across Kumasi & Accra markets",
          href: "/about#scale-story",
          icon: Award,
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
          icon: QrCode,
        },
        {
          title: "Role-Based Approvals",
          description:
            "Enforce manager sign-off on withdrawals and plan modifications",
          href: "/about#security",
          icon: Lock,
        },
        {
          title: "Bank-Grade Accounting",
          description:
            "Complete transparency for auditors, partners, and regulators",
          href: "/about#compliance",
          icon: Landmark,
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
}

export function MegaDropdown({ config, isOpen, onClose }: MegaDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-[4.5rem] w-full bg-white dark:bg-[#09090b] border-b border-slate-200/80 dark:border-slate-800 shadow-2xl transition-all duration-200 z-[300]",
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-2 pointer-events-none",
      )}
      onMouseLeave={onClose}
    >
      <MarketingContainer className="py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Area: 3 Equal Category Columns (Spans 9 Cols) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-8">
            {config.categories.map((category) => (
              <div key={category.title} className="space-y-4">
                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight border-b border-slate-200/60 dark:border-slate-800/80 pb-2.5 font-sans">
                  {category.title}
                </h3>
                <div className="space-y-3.5">
                  {category.items.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        onClick={onClose}
                        className="group flex items-start gap-3.5 p-2 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 group-hover:bg-[#0066cc] group-hover:text-white group-hover:border-[#0066cc] transition-all shadow-xs mt-0.5">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-[#0066cc] dark:group-hover:text-[#38bdf8] transition-colors leading-snug font-sans">
                            {item.title}
                          </p>
                          <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Right Area: Promo Feature Box (Spans 3 Cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#141417] p-5 shadow-sm">
            <div className="space-y-3.5">
              {config.promo.imageSrc && (
                <div className="relative h-36 w-full rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-muted mb-3">
                  <Image
                    src={config.promo.imageSrc}
                    alt={config.promo.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0066cc]/10 text-[#0066cc] dark:text-[#38bdf8] px-3 py-1 text-xs font-bold">
                <Sparkles className="h-3 w-3" />
                {config.promo.badge}
              </span>
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug font-sans">
                {config.promo.title}
              </h4>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {config.promo.description}
              </p>
            </div>

            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800">
              <Link
                href={config.promo.ctaHref}
                onClick={onClose}
                className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-[#0066cc] hover:bg-[#0052a3] text-white px-5 text-sm font-semibold shadow-xs transition-all"
              >
                <span>{config.promo.ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </div>
  );
}
