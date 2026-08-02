import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[15px] rounded transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 font-bold",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-600 text-white font-bold hover:bg-primary-700 shadow-sm hover:shadow-md active:scale-[0.98]",
        secondary:
          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-[#1a1a1a] dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md",
        outline:
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#1a1a1a] dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm hover:shadow-md",
        ghost:
          "hover:bg-accent hover:text-accent-foreground font-semibold text-foreground",
        danger:
          "bg-destructive text-destructive-foreground font-bold shadow-sm hover:bg-destructive/90",
        destructive:
          "bg-destructive text-destructive-foreground font-bold shadow-sm hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline font-semibold p-0 h-auto",
      },
      size: {
        sm: "h-8 rounded px-3 text-xs font-semibold",
        md: "px-8 py-3 text-[15px] font-bold min-h-[44px]",
        lg: "h-12 rounded px-8 text-base font-bold min-h-[48px]",
        icon: "h-9 w-9 p-0 rounded items-center justify-center",
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
