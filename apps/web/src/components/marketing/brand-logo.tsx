import { cn } from "@/lib/utils";

export function SusuFlowIconMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-9 shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="susuflow-grad-primary"
          x1="10"
          y1="10"
          x2="90"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0066CC" />
          <stop offset="50%" stopColor="#0052A3" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <linearGradient
          id="susuflow-grad-accent"
          x1="90"
          y1="10"
          x2="10"
          y2="90"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0052A3" />
        </linearGradient>

        <filter
          id="susuflow-glow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          filterUnits="userSpaceOnUse"
        >
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="#0066CC"
            floodOpacity="0.3"
          />
        </filter>
      </defs>

      {/* Rounded Outer Container Badge */}
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="22"
        fill="url(#susuflow-grad-primary)"
        filter="url(#susuflow-glow)"
      />

      {/* Overlapping Infinity 'S' Flow Arcs */}
      {/* Top Outer Flow Loop */}
      <path
        d="M30 36C30 27.1634 37.1634 20 46 20H60C69.9411 20 78 28.0589 78 38C78 47.9411 69.9411 56 60 56H42C34.268 56 28 62.268 28 70C28 77.732 34.268 84 42 84H62"
        stroke="url(#susuflow-grad-accent)"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Inner Flow Accent Ribbon */}
      <path
        d="M70 64C70 72.8366 62.8366 80 54 80H40C30.0589 80 22 71.9411 22 62C22 52.0589 30.0589 44 40 44H58C65.732 44 72 37.732 72 30C72 22.268 65.732 16 58 16H38"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
        strokeOpacity="0.95"
      />

      {/* Center Core Security Node */}
      <circle cx="50" cy="50" r="5" fill="#ffffff" />
    </svg>
  );
}

export function BrandLogo({
  className,
  onDark = false,
  iconOnly = false,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
  iconOnly?: boolean;
}) {
  if (iconOnly) {
    return <SusuFlowIconMark className={className} />;
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <SusuFlowIconMark />
    </div>
  );
}

export function BrandLockup({
  className,
  onDark = false,
  wordmarkClassName,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-2 sm:gap-3 select-none",
        className,
      )}
    >
      <SusuFlowIconMark className="size-[1.9rem] sm:size-9 shrink-0" />
      <span
        className={cn(
          "truncate text-[1.25rem] sm:text-[1.45rem] font-black tracking-[-0.035em] leading-none font-sans flex items-baseline",
          wordmarkClassName,
        )}
      >
        <span
          className={onDark ? "text-white" : "text-slate-900 dark:text-white"}
        >
          SusuFlow
        </span>
        <span className="text-[#0066cc] dark:text-[#38bdf8] ml-[1px]">.</span>
      </span>
    </span>
  );
}
