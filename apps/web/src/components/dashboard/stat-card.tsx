import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: IconDefinition;
  iconBgClassName?: string;
  iconClassName?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgClassName = 'bg-primary/10',
  iconClassName = 'text-primary',
  trend,
  className,
}: StatCardProps) {
  const footer = trend?.value ?? subtitle;

  return (
    <div
      className={cn(
        'dashboard-tile flex h-full min-h-[8.5rem] flex-col rounded-xl border bg-card p-4 sm:min-h-[10.5rem] sm:p-6',
        className,
      )}
    >
      {icon ? (
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
      ) : null}

      <p className="mt-3 text-xs text-muted-foreground sm:mt-4 sm:text-sm">{title}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground sm:mt-1 sm:text-2xl">
        {value}
      </p>

      {footer ? (
        <p
          className={cn(
            'mt-auto pt-2 text-[0.625rem] leading-snug text-muted-foreground sm:pt-3 sm:text-xs',
            trend && !trend.positive && 'text-destructive',
            trend?.positive && 'text-muted-foreground',
          )}
        >
          {footer}
        </p>
      ) : (
        <span className="mt-auto" aria-hidden />
      )}
    </div>
  );
}
