import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBell,
  faBuilding,
  faChartLine,
  faGaugeHigh,
  faHandHoldingDollar,
  faHistory,
  faPercent,
  faUser,
  faUserPlus,
  faUsers,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';

export type NavItem = { href: string; label: string; icon: IconDefinition };
export type NavGroup = { label: string; items: NavItem[] };

export const staffLinks: NavItem[] = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: faGaugeHigh },
  { href: '/staff/customers', label: 'Customers', icon: faUsers },
  { href: '/staff/deposits', label: 'Deposits', icon: faWallet },
  { href: '/staff/withdrawals', label: 'Withdrawals', icon: faHistory },
  { href: '/staff/settings', label: 'Settings', icon: faChartLine },
];

export const adminLinks: NavItem[] = [
  { href: '/admin/tenants', label: 'Tenants', icon: faBuilding },
  { href: '/admin/tenants/new', label: 'New organization', icon: faUserPlus },
];

export const collectorNavGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ href: '/collector/dashboard', label: 'Dashboard', icon: faGaugeHigh }],
  },
  {
    label: 'Customers',
    items: [{ href: '/collector/customers', label: 'Customers', icon: faUsers }],
  },
  {
    label: 'Deposits',
    items: [
      { href: '/collector/deposit', label: 'Assist deposit', icon: faHandHoldingDollar },
      { href: '/collector/deposits', label: 'Deposit history', icon: faHistory },
    ],
  },
  {
    label: 'Earnings',
    items: [{ href: '/collector/commissions', label: 'Commissions', icon: faPercent }],
  },
];

export const collectorLinks: NavItem[] = collectorNavGroups.flatMap((g) => g.items);

export const customerLinks: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: faGaugeHigh },
  { href: '/deposit', label: 'Deposit', icon: faWallet },
  { href: '/transactions', label: 'History', icon: faHistory },
  { href: '/profile', label: 'Profile', icon: faUser },
];

export function getRoleLabel(roles: string[]): string {
  if (roles.includes('super_admin')) return 'Super Admin account';
  if (roles.includes('company_admin')) return 'Company Admin account';
  if (roles.includes('account_officer')) return 'Account Officer account';
  if (roles.includes('collector')) return 'Collector account';
  return 'Customer account';
}
