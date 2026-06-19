export const APP_NAME = 'SusuFlow';
export const APP_TAGLINE = 'Digital susu savings — verified, transparent, fraud-proof.';
export const SUPPORT_EMAIL = 'hello@susuflow.com';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: '/how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact?intent=demo', label: 'Request demo' },
    { href: '/register', label: 'Join your susu' },
  ],
  company: [
    { href: '/about', label: 'About us' },
    { href: '/contact', label: 'Contact' },
    { href: `mailto:${SUPPORT_EMAIL}`, label: 'Support' },
  ],
  legal: [
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

export const FEATURES = [
  {
    title: 'MoMo-verified deposits',
    description:
      'Every contribution is confirmed by the payment gateway — not by a collector’s word.',
  },
  {
    title: 'Double-entry ledger',
    description: 'Bank-grade accounting so balances always reconcile across wallets and accounts.',
  },
  {
    title: 'Multi-tenant platform',
    description: 'Each susu company runs on its own secure space with branded portals.',
  },
  {
    title: 'Collector tools',
    description: 'Field agents onboard savers and assist deposits without handling cash.',
  },
  {
    title: 'Real-time dashboards',
    description: 'Management sees deposits, customers, and risk signals as they happen.',
  },
  {
    title: 'Audit trails',
    description: 'Immutable logs for regulators, auditors, and dispute resolution.',
  },
];

export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Join your susu',
    description: 'Register under your company’s tenant — e.g. abc-susu — and verify your profile.',
  },
  {
    step: '02',
    title: 'Save via Mobile Money',
    description: 'Deposit through MTN MoMo (and more gateways). Funds hit your wallet only when paid.',
  },
  {
    step: '03',
    title: 'Track & withdraw',
    description: 'View balance and history anytime. Withdrawals follow your group’s rules.',
  },
];

export const AUDIENCE_TABS = [
  {
    id: 'group-leaders',
    title: 'Group Leaders & Organizers',
    description:
      'Streamline your savings cycle, track payments in real time, and send automated reminders — all from your phone.',
    image: '/marketing/audiences/group-leaders.jpg',
    imagePosition: 'object-[50%_20%]',
  },
  {
    id: 'family-friends',
    title: 'Family & Friends',
    description:
      'Easily save together for school fees, projects, or family goals without stress or confusion.',
    image: '/marketing/audiences/family-friends.jpg',
    imagePosition: 'object-center',
  },
  {
    id: 'market-traders',
    title: 'Market Woman & Traders',
    description: 'Go cashless and track contributions confidently — no books, no paper.',
    image: '/marketing/audiences/market-traders.jpg',
    imagePosition: 'object-[50%_35%]',
  },
  {
    id: 'savings-clubs',
    title: 'Savings Clubs & Cooperatives',
    description:
      'Run member cycles with transparent records, payouts, and accountability built in.',
    image: '/marketing/audiences/savings-clubs.jpg',
    imagePosition: 'object-center',
  },
  {
    id: 'anyone-saves',
    title: 'Anyone Who Saves in Groups',
    description:
      'Whether formal or informal, SusuFlow makes group savings easy, faster, and more reliable.',
    image: '/marketing/audiences/anyone-saves.jpg',
    imagePosition: 'object-[50%_25%]',
  },
] as const;

export const AUDIENCES = [
  {
    title: 'Savers',
    description: 'Save daily or weekly with proof of every cedi. No more “the collector took it.”',
    cta: 'Join your susu',
    href: '/register',
  },
  {
    title: 'Collectors',
    description: 'Grow your roster, assist deposits on-site, and earn commission transparently.',
    cta: 'Talk to your admin',
    href: '/register',
  },
  {
    title: 'Susu companies',
    description: 'Run multiple groups, staff roles, and compliance from one admin dashboard.',
    cta: 'Request a demo',
    href: '/contact?intent=demo',
  },
  {
    title: 'Regulators & auditors',
    description: 'Read-only access, exportable reports, and full transaction lineage.',
    cta: 'Contact sales',
    href: '/contact?intent=sales',
  },
];

export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 'Free trial',
    period: '14 days',
    description: 'For small susu groups testing digital collection.',
    features: ['Up to 50 customers', 'MoMo deposits', 'Collector app', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: 'GHS 299',
    period: '/month',
    description: 'For established susu companies scaling cashless operations.',
    features: [
      'Unlimited customers',
      'Staff & collector roles',
      'Ledger & reports',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Multi-branch operators, custom integrations, and SLA.',
    features: ['Dedicated onboarding', 'API access', 'Custom branding', 'Account manager'],
    highlighted: false,
  },
];

export const FAQ_ITEMS = [
  {
    q: 'What is susu?',
    a: 'Susu is a traditional rotating savings scheme in Ghana and West Africa. Members contribute regularly and receive a lump sum on their turn — SusuFlow digitizes the collection side while keeping the trust model.',
  },
  {
    q: 'Do collectors still handle cash?',
    a: 'No. Collectors onboard customers and help them pay via Mobile Money. Cash never passes through the collector’s hands, which removes the biggest source of fraud.',
  },
  {
    q: 'Which payment methods are supported?',
    a: 'MTN Mobile Money via Hubtel is supported in the MVP. Paystack and additional gateways are on the roadmap.',
  },
  {
    q: 'Is my money safe?',
    a: 'Deposits are recorded in a double-entry ledger only after the payment gateway confirms success. You receive a reference and receipt for every transaction.',
  },
];
