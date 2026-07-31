"use client";

import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { DashboardUserMenu } from "@/components/layout/dashboard-user-menu";

const titles: Record<string, string> = {
  // Customer portal
  "/dashboard": "My Savings",
  "/deposit": "Deposit Funds",
  "/withdraw": "Withdraw Funds",
  "/plans": "Savings Goals",
  "/transactions": "Transaction History",
  "/profile": "Profile",

  // Collector portal
  "/collector/dashboard": "Home",
  "/collector/customers": "Customers",
  "/collector/deposit": "Collect",
  "/collector/deposits": "History",
  "/collector/earnings": "Earnings",
  "/collector/activity": "Activity",
  "/collector/profile": "Profile",

  // Staff portal
  "/staff/dashboard": "Dashboard",
  "/staff/customers": "Customers",
  "/staff/customers/new": "Onboard Customer",
  "/staff/deposits": "All Deposits",
  "/staff/withdrawals": "Withdrawals",
  "/staff/plans": "Customer Savings Goals",
  "/staff/ledger": "General Ledger",
  "/staff/kyc": "KYC Review",
  "/staff/fraud": "Fraud & Risk Alerts",
  "/staff/commissions": "Collector Commissions",
  "/staff/audit": "Audit Logs",
  "/staff/reports": "Reports & Analytics",
  "/staff/settings": "Profile & Settings",
  "/staff/profile": "Profile",

  // Admin portal
  "/admin/dashboard": "Admin Control Center",
  "/admin/tenants": "Platform Tenants",
  "/admin/tenants/new": "Create Organization",
  "/admin/users": "Platform Users",
  "/admin/plans": "Platform Savings Goals",
  "/admin/ledger": "Consolidated Ledger",
  "/admin/audit": "System Audit Trail",
  "/admin/kyc": "KYC Review Queue",
  "/admin/fraud": "Fraud Alerts",
  "/admin/health": "System Health",
  "/admin/dev-ops": "DevOps & Database Ops",
  "/admin/billing": "Revenue & Billing",
  "/admin/commissions": "Collector Commissions",
  "/admin/deposits": "Global Deposits",
  "/admin/withdrawals": "Global Withdrawals",
  "/admin/customers": "Savers Directory",
  "/admin/profile": "Admin Profile",
  "/admin/settings": "Platform Configuration",
};

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  variant: "staff" | "admin" | "customer" | "collector";
}

export function DashboardHeader({
  onMenuClick,
  variant,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  const getMobileTitle = () => {
    if (titles[pathname]) return titles[pathname];

    // Dynamic checks
    if (pathname.startsWith("/staff/customers/")) return "Customer Account";
    if (pathname.startsWith("/admin/tenants/")) return "Tenants";

    for (const key of Object.keys(titles)) {
      if (key !== "/" && pathname.startsWith(key)) {
        return titles[key];
      }
    }

    return variant === "admin"
      ? "Platform Admin"
      : variant === "staff"
        ? "Staff Portal"
        : variant === "collector"
          ? "Collector"
          : "My Savings";
  };

  const mobileTitle = getMobileTitle();

  return (
    <header className="dashboard-header flex h-16 shrink-0 items-center justify-between gap-4 border-b-0 border-none bg-background px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
        </Button>
        <p className="mobile-header-title min-w-0 truncate font-bold text-foreground">
          {mobileTitle}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <DashboardUserMenu />
      </div>
    </header>
  );
}
