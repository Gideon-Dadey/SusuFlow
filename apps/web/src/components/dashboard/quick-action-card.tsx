"use client";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";

export interface QuickActionCardProps {
  href: string;
  title: string;
  description: string;
  icon: IconDefinition;
  iconBgClassName?: string;
  iconClassName?: string;
  className?: string;
}

export function QuickActionCard({
  href,
  title,
  description,
  icon,
  iconBgClassName = "bg-secondary/10",
  iconClassName = "text-secondary",
  className,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[105px] sm:min-h-[135px] lg:min-h-[150px] flex-col items-start justify-between rounded-none border border-border/60 bg-card p-2.5 sm:p-4 lg:p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        className,
      )}
    >
      {/* Top Left Icon Box */}
      <div
        className={cn(
          "flex size-7 items-center justify-center rounded-none transition-transform group-hover:scale-105 sm:size-9 lg:size-10 shrink-0 mb-2 sm:mb-3",
          iconBgClassName,
        )}
      >
        <FontAwesomeIcon
          icon={icon}
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-4.5 lg:w-4.5",
            iconClassName,
          )}
        />
      </div>

      <div className="min-w-0 w-full">
        <h3 className="line-clamp-2 text-[10px] sm:text-xs lg:text-sm font-semibold leading-tight tracking-tight text-foreground text-left">
          {title}
        </h3>
        <p className="mt-0.5 sm:mt-1 line-clamp-2 text-[8.5px] sm:text-[10.5px] lg:text-xs leading-tight text-muted-foreground text-left">
          {description}
        </p>
      </div>
    </Link>
  );
}
