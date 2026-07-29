export const APP_NAME = "Credo";
export const APP_TAGLINE =
  "Enterprise Susu & Digital Savings Platform with verified deposits.";
export const SUPPORT_EMAIL = "gideondadey@gmail.com";

export const NAV_LINKS = [
  { href: "/how-it-works", label: "Product" },
  { href: "/about", label: "Why Credo" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

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
    cta: "Start free trial",
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
    cta: "Request a demo",
    ctaHref: "/contact?intent=demo",
    highlighted: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    audience:
      "Multi branch operators with compliance, branding, and integration needs.",
    featureLabel: "Everything in Growth and more:",
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
    cta: "Contact sales",
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
    a: "No. Credo pricing is for the platform. Member deposits go through your payment gateway. You do not pay us per transaction.",
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
    q: "Do savers pay a fee to use Credo?",
    a: "Savers join through your company tenant at no direct cost from Credo. Standard MoMo network fees from their provider still apply.",
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
    entity: "Credo",
    partners: "MTN Mobile Money via Hubtel",
    standards:
      "Designed for Ghana susu operators and the MoMo payments ecosystem",
  },
] as const;

export const CONTACT_OFFICE = {
  headline: "Credo Ghana",
  addressLines: ["Maakro SDA Church Kovak Road", "Kumasi", "Ghana"],
} as const;

export const FAQ_ITEMS = [
  {
    q: "What is susu?",
    a: "Susu is a traditional rotating savings scheme in Ghana and West Africa. Members contribute regularly and receive a lump sum on their turn. Credo digitizes the collection side while keeping the trust model.",
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
