import { cn } from "@/lib/utils";

export function MicroLabel({
  children,
  className,
  onPhoto = false,
}: {
  children: React.ReactNode;
  className?: string;
  onPhoto?: boolean;
}) {
  return (
    <p className={cn("omnih-micro", onPhoto && "text-white/80", className)}>
      <span
        className={cn("omnih-micro-dot", onPhoto && "bg-white")}
        aria-hidden
      />
      {children}
    </p>
  );
}
