import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand-assets";

export function SusuFlowIconMark({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative size-9 shrink-0", className)}
      aria-hidden="true"
    >
      <Image
        src={BRAND_LOGO}
        alt="SusuFlow Logo"
        fill
        sizes="48px"
        className="object-contain"
      />
    </div>
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
        "inline-flex min-w-0 items-center gap-1 select-none",
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
          className={onDark ? "text-white" : "text-slate-900 text-foreground"}
        >
          SusuFlow
        </span>
      </span>
    </span>
  );
}
