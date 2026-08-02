import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border-primary/20",
        brand: "bg-primary/10 text-primary border-primary/20",
        success:
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
        danger:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        destructive:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        info: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        neutral:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        secondary:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
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
    pending: "warning",
    processing: "warning",
    requested: "warning",
    failed: "danger",
    rejected: "danger",
    reversed: "danger",
    offline_pending: "warning",
    syncing: "info",
  };

  const label = status === "offline_pending" ? "Offline Queue" : status;

  return (
    <Badge variant={map[status] || "neutral"}>
      {label.charAt(0).toUpperCase() + label.slice(1).replace("_", " ")}
    </Badge>
  );
}
