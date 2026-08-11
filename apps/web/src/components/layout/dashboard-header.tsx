"use client";

import { usePathname } from "next/navigation";
import { Menu } from "@/components/icons/phosphor";
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
  "/staff/dashboard": "Overview",
  "/staff/queue": "Approvals",
  "/staff/customers": "Customers",
  "/staff/customers/new": "Onboard customer",
  "/staff/deposits": "Deposits",
  "/staff/withdrawals": "Withdrawals",
  "/staff/plans": "Plans",
  "/staff/ledger": "Ledger",
  "/staff/kyc": "KYC",
  "/staff/fraud": "Fraud",
  "/staff/commissions": "Commissions",
  "/staff/audit": "Audit trail",
  "/staff/reports": "Reports",
  "/staff/settings": "Settings",
  "/staff/profile": "Profile",
  "/staff/team": "Team",
  "/staff/collectors/map": "Collectors map",
  "/staff/collectors": "Collectors",
  "/staff/reconciliation": "Reconciliation",
  "/staff/analytics": "Analytics",
  "/staff/notifications": "Notifications",
  "/staff/calculator": "Calculator",
  "/staff/excel": "Excel",

  // Admin portal
  "/admin/dashboard": "Overview",
  "/admin/tenants": "Organizations",
  "/admin/tenants/new": "Create organization",
  "/admin/users": "Platform users",
  "/admin/plans": "Savings goals",
  "/admin/ledger": "Ledger",
  "/admin/audit": "Audit trail",
  "/admin/kyc": "Identity queue",
  "/admin/fraud": "Fraud alerts",
  "/admin/health": "System health",
  "/admin/dev-ops": "DevOps",
  "/admin/billing": "Revenue",
  "/admin/commissions": "Commissions",
  "/admin/deposits": "Deposits",
  "/admin/withdrawals": "Withdrawals",
  "/admin/customers": "Customers",
  "/admin/profile": "Profile",
  "/admin/settings": "Configuration",
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
  const isCompany = variant === "staff" || variant === "admin";

  return (
    <header
      className={
        isCompany
          ? "dashboard-header company-topbar"
          : "dashboard-header flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-3 sm:px-5 lg:px-6"
      }
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          aria-label="Open menu"
          className={isCompany ? "company-icon-btn lg:hidden" : "lg:hidden"}
        >
          <Menu className="h-4 w-4" weight="regular" />
        </Button>
        {isCompany ? (
          <h1 className="company-topbar-title">{mobileTitle}</h1>
        ) : (
          <p className="mobile-header-title min-w-0 truncate font-bold text-foreground lg:hidden">
            {mobileTitle}
          </p>
        )}
      </div>

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
        <DashboardUserMenu />
      </div>
    </header>
  );
}
