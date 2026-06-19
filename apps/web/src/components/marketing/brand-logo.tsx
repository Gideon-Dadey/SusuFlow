import Image from 'next/image';
import { BRAND_LOGO } from '@/lib/brand-assets';
import { APP_NAME } from '@/lib/marketing-data';
import { cn } from '@/lib/utils';

export function BrandLogo({
  className,
  priority = false,
  onDark = false,
  iconOnly = false,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <Image
      src={BRAND_LOGO}
      alt=""
      aria-hidden
      width={iconOnly ? 36 : 200}
      height={iconOnly ? 36 : 48}
      priority={priority}
      className={cn(
        iconOnly
          ? 'h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9'
          : 'h-8 w-auto max-w-[10rem] object-contain object-left sm:h-9 sm:max-w-[11rem]',
        onDark && 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]',
        className,
      )}
    />
  );
}

export function BrandLockup({
  className,
  priority = false,
  onDark = false,
  wordmarkClassName,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1', className)}>
      <BrandLogo priority={priority} onDark={onDark} iconOnly className="-mr-1" />
      <span
        className={cn(
          'truncate text-base font-bold leading-none tracking-tight sm:text-lg',
          onDark && 'drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]',
          wordmarkClassName,
        )}
      >
        <span className={onDark ? 'text-white' : 'text-foreground'}>Susu</span>
        <span className="text-secondary">Flow</span>
      </span>
      <span className="sr-only">{APP_NAME}</span>
    </span>
  );
}
