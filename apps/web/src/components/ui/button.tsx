import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 font-semibold min-h-[48px] px-6 py-2.5",
  {
    variants: {
      variant: {
        primary:
          "bg-[#0066cc] text-white text-[17px] font-semibold rounded-xl hover:bg-[#0052a3] shadow-sm active:scale-[0.98]",
        secondary:
          "bg-muted text-foreground text-[17px] font-semibold rounded-xl hover:bg-muted/80",
        outline:
          "border border-border bg-card text-[17px] font-semibold rounded-xl hover:bg-muted/60 dark:border-zinc-800 dark:hover:border-zinc-700",
        ghost:
          "hover:bg-muted/60 text-muted-foreground hover:text-foreground text-[17px] font-semibold rounded-xl",
        danger:
          "bg-destructive text-destructive-foreground text-[17px] font-bold rounded-xl hover:bg-destructive/90",
      },
      size: {
        sm: "h-10 min-h-[40px] px-4 text-sm font-semibold rounded-lg",
        md: "h-12 min-h-[48px] px-6 text-[17px] font-semibold rounded-xl",
        lg: "h-12 min-h-[48px] sm:h-[52px] sm:min-h-[52px] px-7 text-[17px] font-semibold rounded-xl",
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
