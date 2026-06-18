import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
        warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        danger: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
        info: 'bg-blue-50 text-blue-700 dark:bg-primary/15 dark:text-primary-400',
        neutral: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, VariantProps<typeof badgeVariants>['variant']> = {
    completed: 'success',
    success: 'success',
    active: 'success',
    pending: 'warning',
    processing: 'warning',
    requested: 'warning',
    failed: 'danger',
    rejected: 'danger',
    reversed: 'danger',
  };
  return (
    <Badge variant={map[status] || 'neutral'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
