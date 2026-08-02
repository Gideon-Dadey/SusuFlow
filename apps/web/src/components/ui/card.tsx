import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground rounded-none border border-border/60 shadow-sm transition-all duration-200 p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const PremiumCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-card text-card-foreground rounded-none border border-border/60 shadow-sm p-5 sm:p-6",
      className,
    )}
    {...props}
  />
));
PremiumCard.displayName = "PremiumCard";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-sm sm:text-base font-semibold tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardLabel = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm sm:text-base font-semibold tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
CardLabel.displayName = "CardLabel";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";
