'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { cn } from '@/lib/utils';

export function QuickActionCard({
  href,
  title,
  description,
  icon,
  iconBgClassName,
  iconClassName,
}: {
  href: string;
  title: string;
  description: string;
  icon: IconDefinition;
  iconBgClassName: string;
  iconClassName: string;
}) {
  return (
    <Link
      href={href}
      className="dashboard-tile group flex h-full min-h-[7.25rem] flex-col rounded-xl border border-border/80 bg-card p-3 shadow-card transition-all hover:border-border hover:shadow-elevated sm:min-h-[10.5rem] sm:p-6"
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-lg sm:size-10',
          iconBgClassName,
        )}
      >
        <FontAwesomeIcon
          icon={icon}
          className={cn('h-3.5 w-3.5 sm:h-[1.125rem] sm:w-[1.125rem]', iconClassName)}
        />
      </div>
      <p className="mt-2 text-[0.6875rem] font-semibold leading-tight text-foreground sm:mt-4 sm:text-[0.9375rem] sm:leading-snug">
        {title}
      </p>
      <p className="mt-1 line-clamp-2 text-[0.625rem] leading-snug text-muted-foreground sm:mt-1.5 sm:text-sm sm:leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
