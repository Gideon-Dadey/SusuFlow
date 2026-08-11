"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { BottomNav } from "@/components/layout/bottom-nav";

interface DashboardShellProps {
  children: React.ReactNode;
  variant: "staff" | "admin" | "customer" | "collector";
  showBottomNav?: boolean;
}

export function DashboardShell({
  children,
  variant,
  showBottomNav = variant !== "admin",
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="dashboard-shell" data-portal={variant}>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <Sidebar
        variant={variant === "admin" ? "admin" : "staff"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        customerMode={variant === "customer"}
        collectorMode={variant === "collector"}
      />

      <div className="dashboard-content-column">
        <DashboardHeader
          variant={variant}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main
          className={cn(
            "dashboard-scroll",
            variant === "staff" || variant === "admin"
              ? "company-main"
              : "p-3 pt-2.5 sm:p-4 lg:p-5 pb-6",
            sidebarOpen && "overflow-hidden lg:overflow-y-auto",
          )}
        >
          <div className="dashboard-page w-full max-w-[1780px] mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {showBottomNav ? <BottomNav /> : null}
    </div>
  );
}
