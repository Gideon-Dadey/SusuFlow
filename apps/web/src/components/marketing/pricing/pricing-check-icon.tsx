import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type PricingCheckIconProps = {
  className?: string;
  size?: 'sm' | 'md';
};

export function PricingCheckIcon({ className, size = 'md' }: PricingCheckIconProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-[#22c55e] text-white',
        size === 'sm' ? 'size-5' : 'size-7',
        className,
      )}
      aria-hidden
    >
      <Check className={size === 'sm' ? 'size-3' : 'size-4'} strokeWidth={2.5} />
    </span>
  );
}
