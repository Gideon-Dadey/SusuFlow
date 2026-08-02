import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold transition-all duration-200 border-0",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        brand: "bg-primary/10 text-primary",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        danger: "bg-red-500/10 text-red-600 dark:text-red-400",
        destructive: "bg-red-500/10 text-red-600 dark:text-red-400",
        info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        neutral: "bg-muted/80 text-muted-foreground",
        secondary: "bg-muted/80 text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
    completed: "success",
    success: "success",
    active: "success",
    approved: "success",
    delivered: "success",
    pending: "warning",
    processing: "warning",
    requested: "warning",
    submitted: "warning",
    reviewing: "warning",
    offline_pending: "warning",
    failed: "danger",
    rejected: "danger",
    reversed: "danger",
    cancelled: "danger",
    syncing: "info",
  };

  const label = status === "offline_pending" ? "Offline Queue" : status;

  return (
    <Badge variant={map[status] || "neutral"}>
      {label.charAt(0).toUpperCase() + label.slice(1).replace(/_/g, " ")}
    </Badge>
  );
}
