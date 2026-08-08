import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full px-4 py-3 border border-border/70 rounded-xl bg-background text-foreground transition-all duration-200 shadow-sm font-medium text-sm sm:text-base",
          "hover:border-border focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50",
          error &&
            "border-destructive focus:ring-destructive/20 focus:border-destructive",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  ),
);
Input.displayName = "Input";
