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
          "flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-[16px] text-foreground",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-primary dark:focus:border-zinc-700",
          "disabled:cursor-not-allowed disabled:opacity-50",
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
