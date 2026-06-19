import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 py-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        secondary: 'bg-muted text-foreground hover:bg-muted/80',
        outline:
          'border border-border bg-card hover:bg-muted/60 dark:border-secondary/30 dark:hover:border-secondary/50',
        ghost: 'hover:bg-muted/60 text-muted-foreground hover:text-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'min-h-[36px] px-3 text-sm',
        md: 'min-h-[44px] px-4',
        lg: 'min-h-[48px] px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Skeleton
          className={cn(
            'h-3 rounded-md',
            variant === 'primary' || variant === undefined || variant === 'danger'
              ? 'w-20 bg-primary-foreground/30'
              : 'w-20 bg-foreground/15',
          )}
        />
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = 'Button';
