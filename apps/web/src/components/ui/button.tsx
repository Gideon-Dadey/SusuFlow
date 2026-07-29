import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 py-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm",
        secondary: "bg-muted text-foreground font-semibold hover:bg-muted/80",
        outline:
          "border border-border bg-card font-semibold hover:bg-muted/60 dark:border-secondary/30 dark:hover:border-secondary/50",
        ghost:
          "hover:bg-muted/60 text-muted-foreground hover:text-foreground font-semibold",
        danger:
          "bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90",
      },
      size: {
        sm: "min-h-[36px] px-3 text-xs font-semibold",
        md: "min-h-[44px] px-4 text-[15px]",
        lg: "min-h-[48px] px-6 text-base font-bold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  ),
);
Button.displayName = "Button";
