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
          "w-full px-5 py-3.5 border border-gray-200 dark:border-border rounded bg-gray-50 dark:bg-card text-[#1a1a1a] dark:text-white transition-all duration-300 shadow-sm font-medium text-[16px]",
          "hover:border-gray-300 dark:hover:border-gray-700 focus:bg-white dark:focus:bg-[#1a365d] focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-500",
          "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  ),
);
Input.displayName = "Input";
