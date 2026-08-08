import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs sm:text-sm rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-semibold tracking-tight",
  {
    variants: {
      variant: {
        primary:
          "bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md active:translate-y-0 active:scale-[0.98]",
        secondary:
          "bg-muted text-foreground border border-border/70 font-semibold hover:bg-muted/80 hover:-translate-y-0.5 shadow-sm hover:shadow-md active:translate-y-0",
        outline:
          "border border-border/80 bg-card text-foreground font-semibold hover:bg-muted/60 hover:-translate-y-0.5 shadow-sm hover:shadow-md active:translate-y-0",
        ghost:
          "hover:bg-muted/60 hover:text-foreground font-semibold text-foreground active:scale-[0.98]",
        danger:
          "bg-destructive text-destructive-foreground font-bold shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground font-bold shadow-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0",
        link: "text-secondary underline-offset-4 hover:underline font-semibold p-0 h-auto",
        pill: "bg-secondary text-secondary-foreground font-bold rounded-full hover:bg-secondary/90 hover:-translate-y-0.5 shadow-sm hover:shadow-md active:translate-y-0",
      },
      size: {
        sm: "h-8 rounded-lg px-3 text-xs font-semibold",
        md: "px-5 py-2.5 text-xs sm:text-sm font-bold min-h-[42px] rounded-xl",
        lg: "h-12 rounded-xl px-7 text-base font-bold min-h-[48px]",
        icon: "h-10 w-10 p-0 rounded-xl items-center justify-center",
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
