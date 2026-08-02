import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";

export interface StatCardProps {
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
  iconBgClassName = "bg-emerald-500/10",
  iconClassName = "text-emerald-500",
  trend,
  className,
}: StatCardProps) {
  const footerText = trend?.value ?? subtitle;

  return (
    <article
      className={cn(
        "flex min-w-0 min-h-[105px] sm:min-h-[135px] lg:min-h-[150px] flex-col items-start justify-between rounded-none border border-border/60 bg-card p-2.5 sm:p-4 lg:p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-none sm:size-9 lg:size-10 mb-2 sm:mb-3",
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
      ) : null}

      <div className="min-w-0 w-full">
        <p className="text-[10px] sm:text-xs lg:text-sm font-medium leading-snug text-muted-foreground truncate text-left">
          {title}
        </p>
        <p className="mt-0.5 sm:mt-1 text-sm sm:text-lg lg:text-2xl font-bold leading-tight tabular-nums tracking-tight text-foreground [overflow-wrap:anywhere] text-left">
          {value}
        </p>
        {footerText ? (
          <p
            className={cn(
              "mt-0.5 sm:mt-1 text-[8.5px] sm:text-[10.5px] lg:text-xs leading-snug text-muted-foreground truncate text-left",
              trend && !trend.positive && "text-destructive",
              trend?.positive && "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {footerText}
          </p>
        ) : null}
      </div>
    </article>
  );
}
