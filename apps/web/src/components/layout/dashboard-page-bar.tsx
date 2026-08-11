"use client";

import Link from "next/link";
import { ArrowLeft } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";

type DashboardPageBarProps = {
  title: string;
  backHref?: string;
  className?: string;
  actions?: React.ReactNode;
};

export function DashboardPageBar({
  title,
  backHref,
  className,
  actions,
}: DashboardPageBarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        !actions && "hidden lg:flex",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {backHref ? (
          <Link href={backHref} className="hidden lg:block">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center hover:bg-muted"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        ) : null}
        <h1 className="dashboard-title hidden lg:block">{title}</h1>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
