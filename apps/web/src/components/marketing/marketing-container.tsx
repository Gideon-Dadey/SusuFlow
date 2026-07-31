import { cn } from "@/lib/utils";

export function MarketingContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("sr-container marketing-container", className)}>
      {children}
    </div>
  );
}
