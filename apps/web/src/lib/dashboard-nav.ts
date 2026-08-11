import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { LucideIcon } from "@/components/icons/phosphor";
import {
  Bell,
  BookOpen,
  Brain,
  Calculator,
  ClipboardList,
  Coins,
  FileSpreadsheet,
  Landmark,
  LayoutDashboard,
  Map,
  PieChart,
  PiggyBank,
  Route,
  ScrollText,
  Settings,
  ShieldAlert,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  ArrowUpRight,
} from "@/components/icons/phosphor";
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
} from "@fortawesome/free-solid-svg-icons";

export type NavItem = { href: string; label: string; icon: IconDefinition };
export type NavGroup = { groupLabel: string; items: NavItem[] };

export type StaffNavItem = { href: string; label: string; icon: LucideIcon };
export type StaffNavGroup = { groupLabel: string; items: StaffNavItem[] };

export const staffNavGroups: StaffNavGroup[] = [
  {
    groupLabel: "GENERAL",
    items: [
      { href: "/staff/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/staff/queue", label: "Approvals", icon: ClipboardList },
    ],
  },
  {
    groupLabel: "COLLECTIONS",
    items: [
      { href: "/staff/deposits", label: "Deposits", icon: Wallet },
      { href: "/staff/withdrawals", label: "Withdrawals", icon: ArrowUpRight },
      { href: "/staff/commissions", label: "Commissions", icon: Coins },
    ],
  },
  {
    groupLabel: "BOOKS",
    items: [
      { href: "/staff/plans", label: "Plans", icon: PiggyBank },
      { href: "/staff/ledger", label: "Ledger", icon: BookOpen },
      {
        href: "/staff/reconciliation",
        label: "Reconciliation",
        icon: Landmark,
      },
      { href: "/staff/reports", label: "Reports", icon: PieChart },
    ],
  },
  {
    groupLabel: "PEOPLE",
    items: [
      { href: "/staff/customers", label: "Customers", icon: Users },
      { href: "/staff/kyc", label: "KYC", icon: UserCheck },
      { href: "/staff/team", label: "Team", icon: UserCog },
      { href: "/staff/collectors", label: "Collectors", icon: Route },
    ],
  },
  {
    groupLabel: "CONTROL",
    items: [
      { href: "/staff/fraud", label: "Fraud", icon: ShieldAlert },
      { href: "/staff/audit", label: "Audit", icon: ScrollText },
      { href: "/staff/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    groupLabel: "TOOLS",
    items: [
      { href: "/staff/analytics", label: "Analytics", icon: Brain },
      { href: "/staff/notifications", label: "Notifications", icon: Bell },
      { href: "/staff/collectors/map", label: "Collectors map", icon: Map },
      { href: "/staff/calculator", label: "Calculator", icon: Calculator },
      { href: "/staff/excel", label: "Excel", icon: FileSpreadsheet },
    ],
  },
];

export const staffLinks: StaffNavItem[] = staffNavGroups.flatMap(
  (g) => g.items,
);

export const adminNavGroups: NavGroup[] = [
  {
    groupLabel: "PLATFORM",
    items: [
      { href: "/admin/dashboard", label: "Overview", icon: faGaugeHigh },
      { href: "/admin/tenants", label: "Organizations", icon: faBuilding },
      { href: "/admin/health", label: "System Health", icon: faServer },
      { href: "/admin/dev-ops", label: "DevOps Control", icon: faTerminal },
      { href: "/admin/settings", label: "Configuration", icon: faGear },
    ],
  },
  {
    groupLabel: "GLOBAL FINANCES",
    items: [
      { href: "/admin/deposits", label: "All Deposits", icon: faWallet },
      { href: "/admin/withdrawals", label: "All Withdrawals", icon: faHistory },
      { href: "/admin/billing", label: "Platform Revenue", icon: faCreditCard },
      { href: "/admin/ledger", label: "Consolidated Ledger", icon: faBook },
      {
        href: "/admin/commissions",
        label: "Collector Earnings",
        icon: faCoins,
      },
    ],
  },
  {
    groupLabel: "GLOBAL SAVINGS",
    items: [
      { href: "/admin/plans", label: "Savings Goals", icon: faPiggyBank },
    ],
  },
  {
    groupLabel: "GLOBAL DIRECTORY",
    items: [
      { href: "/admin/customers", label: "Customers Directory", icon: faUsers },
      { href: "/admin/users", label: "Platform Users", icon: faUserPlus },
      { href: "/admin/kyc", label: "Identity Queue", icon: faUserCheck },
    ],
  },
  {
    groupLabel: "SECURITY & AUDITS",
    items: [
      {
        href: "/admin/fraud",
        label: "Fraud Alerts",
        icon: faTriangleExclamation,
      },
      { href: "/admin/audit", label: "System Audit Logs", icon: faListUl },
    ],
  },
  {
    groupLabel: "ACCOUNT",
    items: [{ href: "/admin/profile", label: "Profile", icon: faUser }],
  },
];

export const adminLinks: NavItem[] = adminNavGroups.flatMap((g) => g.items);

export const customerLinks: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: faGaugeHigh },
  { href: "/deposit", label: "Deposit", icon: faWallet },
  { href: "/withdraw", label: "Withdraw", icon: faWallet },
  { href: "/plans", label: "Goals", icon: faChartLine },
  { href: "/kyc", label: "Verification", icon: faUserCheck },
  { href: "/profile", label: "Profile", icon: faUser },
];

export const collectorLinks: NavItem[] = [
  { href: "/collector/dashboard", label: "Home", icon: faGaugeHigh },
  { href: "/collector/deposit", label: "Collect", icon: faWallet },
  { href: "/collector/customers", label: "Customers", icon: faUsers },
  { href: "/collector/deposits", label: "History", icon: faHistory },
  { href: "/collector/earnings", label: "Earnings", icon: faCoins },
  { href: "/collector/activity", label: "Activity", icon: faListUl },
  { href: "/collector/profile", label: "Profile", icon: faUser },
];

export function getRoleLabel(roles: string[]): string {
  if (roles.includes("super_admin")) return "Super Admin account";
  if (roles.includes("company_admin")) return "Company Admin account";
  if (roles.includes("account_officer")) return "Account Officer account";
  if (roles.includes("collector")) return "Collector account";
  if (roles.includes("auditor")) return "Auditor account";
  return "Customer account";
}
