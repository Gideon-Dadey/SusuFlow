"use client";

import Link from "next/link";
import { ArrowLeft } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";

export const COMPANY_HEADER_ACTIONS_ID = "company-header-actions";

type CompanyPageHeaderProps = {
  title?: string;
  backHref?: string;
  actions?: React.ReactNode;
  lead?: React.ReactNode;
  className?: string;
};

export function CompanyPageHeader({
  backHref,
  actions,
  lead,
  className,
}: CompanyPageHeaderProps) {
  if (!backHref && !actions && !lead) return null;

  return (
    <div className={cn("company-overview-hero", className)}>
      {backHref || lead ? (
        <div className="flex min-w-0 items-center gap-2">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Go back"
              className="company-icon-btn hidden lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : null}
          {lead}
        </div>
      ) : null}
      {actions ? <div className="company-cta-bar">{actions}</div> : null}
    </div>
  );
}
