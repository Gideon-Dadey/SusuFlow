import { cn, formatGhs } from '@/lib/utils';

interface MoneyDisplayProps {
  amount: number | string;
  type?: 'credit' | 'debit' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  className?: string;
}

export function MoneyDisplay({
  amount,
  type = 'neutral',
  size = 'md',
  showSign = false,
  className,
}: MoneyDisplayProps) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const sizes = {
    sm: 'text-sm',
    md: 'text-base font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-4xl font-bold tracking-tight',
  };
  const colors = {
    credit: 'text-credit',
    debit: 'text-debit',
    neutral: 'text-foreground',
  };

  const sign = showSign && type === 'credit' ? '+' : showSign && type === 'debit' ? '-' : '';

  return (
    <span className={cn(sizes[size], colors[type], className)}>
      {sign}
      {formatGhs(Math.abs(num))}
    </span>
  );
}
