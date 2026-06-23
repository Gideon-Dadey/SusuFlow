import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBuilding,
  faChartLine,
  faGaugeHigh,
  faHistory,
  faUser,
  faUserPlus,
  faUsers,
  faWallet,
  faUserCheck,
  faTriangleExclamation,
  faPiggyBank,
  faCoins,
  faBook,
  faListUl,
  faChartPie,
  faGear,
  faServer,
  faTerminal,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';

export type NavItem = { href: string; label: string; icon: IconDefinition };

export type NavGroup = { groupLabel: string; items: NavItem[] };

export const staffNavGroups: NavGroup[] = [
  {
    groupLabel: 'PLATFORM',
    items: [
      { href: '/staff/dashboard', label: 'Overview', icon: faGaugeHigh },
    ],
  },
  {
    groupLabel: 'FINANCE',
    items: [
      { href: '/staff/deposits', label: 'Deposits', icon: faWallet },
      { href: '/staff/withdrawals', label: 'Withdrawals', icon: faHistory },
      { href: '/staff/commissions', label: 'Commissions', icon: faCoins },
      { href: '/staff/ledger', label: 'Trial Balance', icon: faBook },
    ],
  },
  {
    groupLabel: 'OPERATIONS',
    items: [
      { href: '/staff/plans', label: 'Savings Goals', icon: faPiggyBank },
      { href: '/staff/reports', label: 'Reports', icon: faChartPie },
      { href: '/staff/audit', label: 'Audit Logs', icon: faListUl },
    ],
  },
  {
    groupLabel: 'PEOPLE',
    items: [
      { href: '/staff/customers', label: 'Customers', icon: faUsers },
      { href: '/staff/kyc', label: 'KYC Documents', icon: faUserCheck },
    ],
  },
  {
    groupLabel: 'SECURITY',
    items: [
      { href: '/staff/fraud', label: 'Fraud Alerts', icon: faTriangleExclamation },
      { href: '/staff/settings', label: 'Settings', icon: faGear },
    ],
  },
];

/* flat list kept for backward compat (bottom-nav, etc.) */
export const staffLinks: NavItem[] = staffNavGroups.flatMap((g) => g.items);

export const adminNavGroups: NavGroup[] = [
  {
    groupLabel: 'PLATFORM',
    items: [
      { href: '/admin/dashboard', label: 'Overview', icon: faGaugeHigh },
      { href: '/admin/tenants', label: 'Organizations', icon: faBuilding },
      { href: '/admin/health', label: 'System Health', icon: faServer },
      { href: '/admin/dev-ops', label: 'DevOps Control', icon: faTerminal },
      { href: '/admin/settings', label: 'Configuration', icon: faGear },
    ],
  },
  {
    groupLabel: 'GLOBAL FINANCES',
    items: [
      { href: '/admin/deposits', label: 'All Deposits', icon: faWallet },
      { href: '/admin/withdrawals', label: 'All Withdrawals', icon: faHistory },
      { href: '/admin/billing', label: 'Platform Revenue', icon: faCreditCard },
      { href: '/admin/ledger', label: 'Consolidated Ledger', icon: faBook },
      { href: '/admin/commissions', label: 'Collector Earnings', icon: faCoins },
    ],
  },
  {
    groupLabel: 'GLOBAL SAVINGS',
    items: [
      { href: '/admin/plans', label: 'Savings Goals', icon: faPiggyBank },
    ],
  },
  {
    groupLabel: 'GLOBAL DIRECTORY',
    items: [
      { href: '/admin/customers', label: 'Customers Directory', icon: faUsers },
      { href: '/admin/users', label: 'Platform Users', icon: faUserPlus },
      { href: '/admin/kyc', label: 'Identity Queue', icon: faUserCheck },
    ],
  },
  {
    groupLabel: 'SECURITY & AUDITS',
    items: [
      { href: '/admin/fraud', label: 'Fraud Alerts', icon: faTriangleExclamation },
      { href: '/admin/audit', label: 'System Audit Logs', icon: faListUl },
    ],
  },
  {
    groupLabel: 'ACCOUNT',
    items: [
      { href: '/admin/profile', label: 'Profile', icon: faUser },
    ],
  },
];

export const adminLinks: NavItem[] = adminNavGroups.flatMap((g) => g.items);

export const customerLinks: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: faGaugeHigh },
  { href: '/deposit', label: 'Deposit', icon: faWallet },
  { href: '/withdraw', label: 'Withdraw', icon: faWallet },
  { href: '/plans', label: 'Goals', icon: faChartLine },
  { href: '/profile', label: 'Profile', icon: faUser },
];

export function getRoleLabel(roles: string[]): string {
  if (roles.includes('super_admin')) return 'Super Admin account';
  if (roles.includes('company_admin')) return 'Company Admin account';
  if (roles.includes('account_officer')) return 'Account Officer account';
  return 'Customer account';
}
