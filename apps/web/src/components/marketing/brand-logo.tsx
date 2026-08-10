import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand-assets";

/** Full SusuFlow wordmark (blob + name). Aspect ~2.64:1 */
export function SusuFlowIconMark({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={BRAND_LOGO}
      alt="SusuFlow"
      width={264}
      height={100}
      priority={priority}
      className={cn("h-9 w-auto object-contain", className)}
    />
  );
}

export function BrandLogo({
  className,
  priority = false,
  iconOnly = false,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <SusuFlowIconMark
      className={cn(
        iconOnly ? "h-9 w-auto" : "h-8 max-w-[9rem] w-auto",
        className,
      )}
      priority={priority}
    />
  );
}

export function BrandLockup({
  className,
  priority = false,
  wordmarkClassName,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
  /** @deprecated Wordmark is part of the logo image */
  wordmarkClassName?: string;
}) {
  void wordmarkClassName;
  return (
    <span
      className={cn("inline-flex min-w-0 items-center select-none", className)}
    >
      <SusuFlowIconMark
        priority={priority}
        className="h-[1.9rem] sm:h-9 w-auto max-w-[11rem] shrink-0"
      />
    </span>
  );
}
