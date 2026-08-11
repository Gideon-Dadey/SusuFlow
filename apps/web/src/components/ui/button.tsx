import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { HC } from "@/lib/portal-styles";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[15px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: HC.btnPrimary,
        auth: "bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm text-[13.5px] dark:bg-primary-600 dark:text-white",
        secondary: HC.btnSecondary,
        outline: HC.btnSecondary,
        ghost:
          "hover:bg-muted/60 hover:text-foreground font-semibold text-foreground",
        danger: HC.btnDanger,
        destructive: HC.btnDanger,
        link: "text-primary-600 underline-offset-4 hover:underline font-medium p-0 h-auto",
        pill: HC.btnPrimary,
      },
      size: {
        sm: "h-8 px-3 text-xs font-semibold",
        md: "px-4 py-2.5 text-[15px] font-bold min-h-[42px]",
        lg: "py-3.5 px-7 text-[15px] font-bold min-h-[48px]",
        icon: "h-10 w-10 p-0 items-center justify-center",
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
