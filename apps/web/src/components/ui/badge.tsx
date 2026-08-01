import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        success:
          "bg-[#0066cc]/10 text-[#0066cc] dark:bg-[#0066cc]/20 dark:text-[#38bdf8]",
        warning:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
        danger: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300",
        info: "bg-blue-50 text-blue-700 dark:bg-primary/15 dark:text-primary-400",
        neutral: "bg-muted text-muted-foreground",
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
