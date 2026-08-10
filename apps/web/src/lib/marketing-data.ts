export const APP_NAME = "SusuFlow";
export const APP_TAGLINE =
  "Enterprise Susu & Digital Savings Platform with verified deposits.";
export const SUPPORT_EMAIL = "gideondadey@gmail.com";

export const NAV_LINKS = [
  { href: "/how-it-works", label: "Product" },
  { href: "/about", label: "Why SusuFlow" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

/* --- OFX-style mega navigation --- */

export interface MegaNavLink {
  title: string;
  description: string;
  href: string;
}

export interface MegaNavColumn {
  heading: string;
  links: MegaNavLink[];
}

export interface MegaNavPromo {
  title: string;
  body: string;
  cta: string;
  href: string;
}

export interface MegaNavItem {
  label: string;
  href?: string;
  columns?: MegaNavColumn[];
  promo?: MegaNavPromo;
}

export const MEGA_NAV: MegaNavItem[] = [
  {
    label: "Product",
    columns: [
      {
        heading: "Collections & Payments",
        links: [
          {
            title: "MoMo Deposits",
            description: "Gateway-verified Mobile Money collections",
            href: "/product/accounts-and-payments",
          },
          {
            title: "Payouts & Transfers",
            description: "Approved payouts straight to member wallets",
            href: "/product/accounts-and-payments",
          },
          {
            title: "Collector App",
            description: "Cashless field collections with instant receipts",
            href: "/product/accounts-and-payments",
          },
        ],
      },
      {
        heading: "Manage & Control",
        links: [
          {
            title: "Control Hub",
            description: "Approvals, roles, workflows and access rights",
            href: "/product/manage-and-control",
          },
          {
            title: "Payout Approvals",
            description: "Role-based sign-offs before funds move",
            href: "/product/manage-and-control",
          },
          {
            title: "Commission Tracking",
            description: "Automatic collector commissions, zero disputes",
            href: "/product/manage-and-control",
          },
        ],
      },
      {
        heading: "Platform Capabilities",
        links: [
          {
            title: "Ledger & Reports",
            description: "Double-entry books with exportable reports",
            href: "/product/platform-capabilities",
          },
          {
            title: "Audit Trail",
            description: "Every cedi traceable from deposit to payout",
            href: "/product/platform-capabilities",
          },
          {
            title: "Integrations & API",
            description: "Hubtel gateway today, more on the roadmap",
            href: "/product/platform-capabilities",
          },
        ],
      },
    ],
    promo: {
      title: "Run collections without cash.",
      body: "100% verified deposits, zero notebook disputes. Get started for free.",
      cta: "Get started for free",
      href: "/register",
    },
  },
  {
    label: "Why SusuFlow",
    columns: [
      {
        heading: "Solutions For",
        links: [
          {
            title: "Susu Companies & MFIs",
            description: "All your branches. One platform. One login",
            href: "/why-susuflow/susu-companies-and-mfis",
          },
          {
            title: "Field Collectors",
            description: "Cashless agents with a mobile-first workflow",
            href: "/why-susuflow/field-collectors",
          },
          {
            title: "Accountants & Management",
            description: "Live balances and auditor-ready exports",
            href: "/why-susuflow/accountants-and-management",
          },
        ],
      },
      {
        heading: "Use Cases",
        links: [
          {
            title: "Zero Notebook Fraud",
            description: "Replace paper ledgers with verified records",
            href: "/why-susuflow/zero-notebook-fraud",
          },
          {
            title: "Cashless Market Collections",
            description: "MoMo prompts at the stall, not cash in a bag",
            href: "/why-susuflow/cashless-market-collections",
          },
          {
            title: "Role-Based Approvals",
            description: "Segregate duties across staff and branches",
            href: "/why-susuflow/role-based-approvals",
          },
        ],
      },
      {
        heading: "Trust & Security",
        links: [
          {
            title: "Gateway Verification",
            description: "Deposits credit only after gateway confirmation",
            href: "/why-susuflow/gateway-verification",
          },
          {
            title: "Bank-Grade Accounting",
            description: "Double-entry ledger behind every balance",
            href: "/why-susuflow/bank-grade-accounting",
          },
          {
            title: "About SusuFlow",
            description: "Digitizing susu without breaking its trust",
            href: "/about",
          },
        ],
      },
    ],
    promo: {
      title: "There's a story behind every deposit.",
      body: "See how susu companies across Ghana are going cashless with SusuFlow.",
      cta: "Read the market story",
      href: "/why-susuflow/market-scale-story",
    },
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    columns: [
      {
        heading: "Resources",
        links: [
          {
            title: "Blog",
            description: "Insights, SusuFlow news and operator stories",
            href: "/resources",
          },
          {
            title: "How It Works",
            description: "From setup to first verified collection cycle",
            href: "/how-it-works",
          },
          {
            title: "Pricing FAQ",
            description: "Plans, fees and everything in between",
            href: "/pricing#faq",
          },
        ],
      },
      {
        heading: "Company",
        links: [
          {
            title: "About SusuFlow",
            description: "Moving and managing member savings, properly",
            href: "/about",
          },
          {
            title: "Contact & Support",
            description: "Real people. Real help. On hand for you",
            href: "/contact",
          },
          {
            title: "Book a Demo",
            description: "A personalised walkthrough with our team",
            href: "/contact?intent=demo",
          },
        ],
      },
    ],
    promo: {
      title: "New to digital susu?",
      body: "Start with our guide to running your first cashless collection cycle.",
      cta: "See how it works",
      href: "/how-it-works",
    },
  },
];

export interface ResourceArticle {
  slug: string;
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
}

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    slug: "operators-guide-cashless-collections",
    category: "Operations",
    date: "3 August 2026",
    readTime: "4 minute read",
    title: "The operator's guide to cashless susu collections",
    excerpt:
      "Accuracy, trust and detail define great susu companies. But for too long, they've come at the cost of notebooks, cash floats and end-of-month headaches…",
  },
  {
    slug: "how-growing-susu-companies-save-time",
    category: "Growth",
    date: "3 August 2026",
    readTime: "14 minute read",
    title: "How fast-growing susu companies are saving time with verified MoMo",
    excerpt:
      "From one collector team to multi-branch operations: what changes when every deposit is gateway-confirmed before it hits the ledger.",
  },
  {
    slug: "collect-smarter-with-collector-app",
    category: "Product",
    date: "3 August 2026",
    readTime: "8 minute read",
    title: "Collect smarter with the SusuFlow Collector App",
    excerpt:
      "Send MoMo prompts at the market stall, onboard members in minutes, and never carry cash again. Here's how field teams work in SusuFlow.",
  },
  {
    slug: "ending-notebook-fraud",
    category: "Trust & Security",
    date: "27 July 2026",
    readTime: "6 minute read",
    title: "Ending notebook fraud: why verified deposits change everything",
    excerpt:
      "Disputed entries and missing cash have haunted susu for decades. Gateway verification removes the argument before it starts.",
  },
  {
    slug: "double-entry-for-susu",
    category: "Accounting",
    date: "20 July 2026",
    readTime: "9 minute read",
    title: "Bank-grade books: double-entry accounting for susu companies",
    excerpt:
      "What auditors, MFI boards and regulators expect from your records — and how a proper ledger gets you there without hiring a back office.",
  },
  {
    slug: "payout-approvals-that-scale",
    category: "Operations",
    date: "12 July 2026",
    readTime: "5 minute read",
    title: "Payout approvals that scale with your team",
    excerpt:
      "Segregation of duties isn't just for banks. Set clear approval rules so every payout moves with accountability, at any branch.",
  },
];

export const FOOTER_LINKS = {
  product: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact?intent=demo", label: "Request demo" },
    { href: "/register", label: "Join your susu" },
  ],
  company: [
    { href: "/about", label: "About us" },
    { href: "/contact", label: "Contact" },
    { href: `mailto:${SUPPORT_EMAIL}`, label: "Support" },
  ],
  legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faMobileScreenButton,
  faShieldHalved,
  faUserCheck,
  faChartLine,
  faPaperPlane,
  faScaleBalanced,
  faBook,
  faMoneyBillWave,
  faMessage,
  faTriangleExclamation,
  faClock,
  faFileLines,
  faBuilding,
  faUserPlus,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

export interface CapabilityItem {
  label: string;
  icon: IconDefinition;
}

export interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: IconDefinition;
}

export const MOMO_PAY_CAPABILITIES: readonly CapabilityItem[] = [
  { label: "MoMo Deposits", icon: faMobileScreenButton },
  { label: "Verified Settlements", icon: faShieldHalved },
  { label: "Collector Prompts", icon: faUserCheck },
  { label: "Live Dashboards", icon: faChartLine },
  { label: "Group Payouts", icon: faPaperPlane },
  { label: "Audit & Reconcile", icon: faScaleBalanced },
] as const;

export const HOW_IT_WORKS_TRADITIONAL_PAINS: readonly CapabilityItem[] = [
  { label: "Paper ledger books", icon: faBook },
  { label: "Cash in the field", icon: faMoneyBillWave },
  { label: "WhatsApp receipts", icon: faMessage },
  { label: "Collector disputes", icon: faTriangleExclamation },
  { label: "Slow reconciliation", icon: faClock },
  { label: "Weak audit trails", icon: faFileLines },
] as const;

export const HOW_IT_WORKS_STEPS: readonly StepItem[] = [
  {
    step: "01",
    title: "Set up your company",
    description:
      "Create your tenant, invite staff, and configure settings from one admin dashboard.",
    icon: faBuilding,
  },
  {
    step: "02",
    title: "Members sign up directly",
    description:
      "Savers join your company online in minutes. No manual paperwork or collector visits needed.",
    icon: faUserPlus,
  },
  {
    step: "03",
    title: "Direct MoMo deposits",
    description:
      "Savers deposit funds directly from their own Mobile Money wallet, getting an instant confirmation receipt.",
    icon: faMobileScreenButton,
  },
  {
    step: "04",
    title: "Verify deposits & approve payouts",
    description:
      "Staff review deposits and payout requests with a full audit trail. Every cedi is traceable from deposit to payout.",
    icon: faFileCircleCheck,
  },
] as const;

export type PricingCellValue = boolean | string;

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "Free trial",
    period: "14 days",
    audience:
      "Run your first digital collection cycle with one collector team.",
    featureLabel: "Key features:",
    featureGroups: [
      {
        title: "MoMo collections",
        items: [
          "Verified MoMo deposits",
          "Collector mobile app",
          "Payment references and receipts",
        ],
      },
      {
        title: "Ledger",
        items: ["Up to 50 customers", "Basic balance view"],
      },
      {
        title: "Support",
        items: ["Email support", "Onboarding guidance"],
      },
    ],
    cta: "Get started",
    ctaHref: "/contact?intent=demo",
    highlighted: false,
    popular: false,
  },
  {
    name: "Growth",
    price: "GHS 299",
    period: "/month",
    audience:
      "Scale cashless operations with staff roles, reports, and priority support.",
    featureLabel: "Everything in Starter and more:",
    featureGroups: [
      {
        title: null,
        items: [
          "Unlimited customers",
          "Staff and collector roles",
          "Full ledger and exportable reports",
          "Commission tracking",
          "Priority support",
        ],
      },
    ],
    cta: "Try it free for 30 days",
    ctaHref: "/contact?intent=demo",
    highlighted: true,
    popular: true,
  },
  {
    name: "Custom",
    price: "Custom Pricing",
    period: "",
    audience:
      "Designed to scale with your business. If you need over 50 users or have high transaction volumes, get in touch with us.",
    featureLabel: "Everything you get in Growth and more:",
    featureGroups: [
      {
        title: null,
        items: [
          "Multi branch support",
          "Dedicated onboarding",
          "API access",
          "Custom branding",
          "Dedicated account manager",
        ],
      },
    ],
    cta: "Submit",
    ctaHref: "/contact?intent=sales",
    highlighted: false,
    popular: false,
  },
] as const;

export const PRICING_COMPARISON_GROUPS = [
  {
    category: "MoMo and collections",
    rows: [
      {
        feature: "Verified MoMo deposits",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Gateway webhook reconciliation",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Collector mobile app",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Payment reference and receipts",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Collection reminders",
        starter: false,
        growth: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Ledger and reports",
    rows: [
      {
        feature: "Customer limit",
        starter: "Up to 50",
        growth: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        feature: "Real time ledger balances",
        starter: "Basic",
        growth: "Full",
        enterprise: "Full",
      },
      {
        feature: "Commission tracking",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Exportable reports",
        starter: "Basic",
        growth: "Full",
        enterprise: "Custom",
      },
      {
        feature: "Audit trail per transaction",
        starter: true,
        growth: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Team and operations",
    rows: [
      {
        feature: "Staff and collector roles",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Collector assignments",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Payout approval workflows",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Multi branch support",
        starter: false,
        growth: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Platform and integrations",
    rows: [
      {
        feature: "API access",
        starter: false,
        growth: false,
        enterprise: true,
      },
      {
        feature: "Custom branding",
        starter: false,
        growth: false,
        enterprise: true,
      },
      {
        feature: "Dedicated onboarding",
        starter: false,
        growth: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    rows: [
      {
        feature: "Email support",
        starter: true,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Priority support",
        starter: false,
        growth: true,
        enterprise: true,
      },
      {
        feature: "Dedicated account manager",
        starter: false,
        growth: false,
        enterprise: true,
      },
    ],
  },
] as const satisfies ReadonlyArray<{
  category: string;
  rows: ReadonlyArray<{
    feature: string;
    starter: PricingCellValue;
    growth: PricingCellValue;
    enterprise: PricingCellValue;
  }>;
}>;

export const PRICING_AUDIENCES = [
  {
    plan: "Starter",
    title: "First time going digital",
    description:
      "You run a small group and want to try verified MoMo deposits with a single collector before rolling out company wide.",
  },
  {
    plan: "Growth",
    title: "Ready to scale cashless",
    description:
      "You have active collectors in the field, daily collections, and management needs live balances and exportable reports.",
  },
  {
    plan: "Enterprise",
    title: "Operating at regional scale",
    description:
      "You run multiple branches, need auditor ready exports, custom branding, and a direct line to our team.",
  },
] as const;

export const PRICING_ROI = [
  {
    manual: "Disputed cash collections",
    digital: "Gateway verified MoMo deposits",
  },
  {
    manual: "End of month reconciliation",
    digital: "Real time ledger balances",
  },
  {
    manual: "WhatsApp screenshot records",
    digital: "Reference and receipt per payment",
  },
  {
    manual: "Weak audit trail",
    digital: "Exportable reports for staff and auditors",
  },
] as const;

export const PRICING_TRUST_LINE =
  "Built for Ghanaian susu companies moving from notebooks and cash to verified MoMo.";

export const PRICING_FAQ = [
  {
    q: "How do I know if Starter is right for my business?",
    a: "If you run a smaller group and want to test verified MoMo deposits with one collector before rolling out company wide, Starter gives you a 14 day free trial with up to 50 customers.",
  },
  {
    q: "How do I know if Growth is right for my business?",
    a: "If you have active collectors in the field, daily collections, and management needs live balances and exportable reports, Growth adds unlimited customers, staff roles, and priority support.",
  },
  {
    q: "How do I know if Enterprise is right for my business?",
    a: "If you operate multiple branches, need custom branding, API access, or a dedicated account manager, contact our team for a tailored Enterprise package.",
  },
  {
    q: "Do you charge per deposit?",
    a: "No. SusuFlow pricing is for the platform. Member deposits go through your payment gateway. You do not pay us per transaction.",
  },
  {
    q: "Is there a setup fee?",
    a: "Starter includes a 14 day free trial. Growth and Enterprise onboarding is included in your plan. No hidden setup charges.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Start on Starter or Growth and upgrade when your customer count or team size grows. Our team can help you migrate.",
  },
  {
    q: "Do savers pay a fee to use SusuFlow?",
    a: "Savers join through your company tenant at no direct cost from SusuFlow. Standard MoMo network fees from their provider still apply.",
  },
  {
    q: "Can I cancel monthly?",
    a: "Growth is billed monthly with no long term lock in. Enterprise terms are agreed during sales onboarding.",
  },
  {
    q: "What payment methods do you accept for the subscription?",
    a: "We invoice susu companies in GHS. Bank transfer and Mobile Money settlement options are available during onboarding.",
  },
] as const;

export const ABOUT_TRUST_LINE =
  "Built for Ghanaian susu companies moving from notebooks and cash to verified MoMo.";

export const ABOUT_PEOPLE = [
  {
    title: "Our mission",
    description:
      "Digitize susu collections without breaking the community trust that makes savings work in Ghana.",
    href: "/about#mission",
    cta: "Read our story",
  },
  {
    title: "Onboarding specialists",
    description:
      "Hands on setup for your tenant, collector roles, and your first verified MoMo collection cycle.",
    href: "/contact?intent=demo",
    cta: "Book onboarding",
  },
  {
    title: "Support team",
    description:
      "Responsive help when collectors, staff, or management need answers in the field or at the office.",
    href: "/contact",
    cta: "Contact support",
  },
] as const;

export const ABOUT_PLATFORM_LINKS = [
  { label: "MoMo Deposits", href: "/how-it-works" },
  { label: "Collector App", href: "/how-it-works" },
  { label: "Live Dashboards", href: "/how-it-works" },
  { label: "Payout Approvals", href: "/how-it-works" },
  { label: "Commission Tracking", href: "/pricing" },
  { label: "Audit Reports", href: "/pricing" },
] as const;

export const ABOUT_VALUES = [
  {
    title: "Trust first",
    body: "Every cedi is gateway confirmed. Savers see proof. Companies see reconciled books.",
  },
  {
    title: "Built for Ghana",
    body: "MTN MoMo, local susu culture, and field collectors. Not a generic Western fintech clone.",
  },
  {
    title: "Transparency",
    body: "Double entry ledgers, audit trails, and role based access so nothing hides in spreadsheets.",
  },
  {
    title: "Inclusive growth",
    body: "Digital tools that strengthen susu relationships instead of replacing them.",
  },
] as const;

export const ABOUT_COMPLIANCE_POINTS = [
  "Deposits credit only after the payment gateway confirms success",
  "Double entry ledger with reference and receipt per transaction",
  "Role based access for staff, collectors, and approvers",
  "Exportable reports for management review and audit readiness",
] as const;

export const ABOUT_OPERATING_DETAILS = [
  {
    region: "Ghana",
    entity: "SusuFlow",
    partners: "MTN Mobile Money via Hubtel",
    standards:
      "Designed for Ghana susu operators and the MoMo payments ecosystem",
  },
] as const;

export const CONTACT_OFFICE = {
  headline: "SusuFlow Ghana",
  addressLines: ["Maakro SDA Church Kovak Road", "Kumasi", "Ghana"],
} as const;

export const HOME_CAPABILITY_TABS = [
  {
    id: "momo-deposits",
    label: "MoMo Deposits (1)",
    title: "Gateway-verified Mobile Money deposits",
    description:
      "Savers pay directly from their MoMo wallet. Every deposit is confirmed against the payment gateway before it hits the ledger, eliminating disputed receipts and manual reconciliation.",
  },
  {
    id: "field-ops",
    label: "Field Operations (2)",
    title: "Cashless collector workflows",
    description:
      "Collectors onboard members, send MoMo prompts in the field, and track activity from a mobile app. No cash handoffs, no notebook disputes, and every action leaves an audit trail.",
  },
  {
    id: "multi-branch",
    label: "Multi-Branch Control (3)",
    title: "Run every branch from one hub",
    description:
      "Configure staff roles, approval rules, and branch settings from a single admin dashboard. Scale from one collector team to multi-branch susu companies without losing control.",
  },
  {
    id: "audit",
    label: "Audit & Reconcile (4)",
    title: "Bank-grade ledger and reporting",
    description:
      "Double-entry accounting, exportable reports, and reference-linked receipts give management and accountants the visibility they need for audits, reviews, and daily operations.",
  },
  {
    id: "payouts",
    label: "Payouts & Approvals (5)",
    title: "Role-based payout sign-offs",
    description:
      "Tailored approval workflows for deposits, payouts, and staff access ensure every cedi moves with accountability. Staff review requests with a full history before funds are released.",
  },
] as const;

export const HOME_TESTIMONIALS = [
  {
    quote:
      "SusuFlow sounds like the solution we have been waiting for. Verified MoMo deposits give confidence that our members' contributions are tracked properly. It will truly help us plan better for collections and payouts.",
    author: "Grace M.",
    role: "Susu company operator, Accra",
    image: "/marketing/testimonials/grace-m-accra.png",
    imageAlt: "Grace M., susu company operator in Accra, smiling in her office",
    imagePosition: "58% 22%",
  },
  {
    quote:
      "As a susu manager, I am always worried about collector disputes and missing cash. The SusuFlow model is exciting because it focuses on affordable, reliable, gateway-confirmed collections. It gives me hope we can scale without fraud.",
    author: "Amina K.",
    role: "Operations lead, Kumasi",
  },
  {
    quote:
      "I send money home for family susu contributions from abroad. A platform like this would bring so much peace of mind — knowing deposits are verified and balances are visible without waiting for WhatsApp updates.",
    author: "David M.",
    role: "Diaspora member, Minnesota",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "What is susu?",
    a: "Susu is a traditional rotating savings scheme in Ghana and West Africa. Members contribute regularly and receive a lump sum on their turn. SusuFlow digitizes the collection side while keeping the trust model.",
  },
  {
    q: "Do collectors still handle cash?",
    a: "No. Collectors onboard customers and help them pay via Mobile Money. Cash never passes through the collector’s hands, which removes the biggest source of fraud.",
  },
  {
    q: "Which payment methods are supported?",
    a: "MTN Mobile Money via Hubtel is supported in the MVP. Paystack and additional gateways are on the roadmap.",
  },
  {
    q: "Is my money safe?",
    a: "Deposits are recorded in a double-entry ledger only after the payment gateway confirms success. You receive a reference and receipt for every transaction.",
  },
];
