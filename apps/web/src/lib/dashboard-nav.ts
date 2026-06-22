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
} from '@fortawesome/free-solid-svg-icons';

export type NavItem = { href: string; label: string; icon: IconDefinition };

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
  return 'Customer account';
}
