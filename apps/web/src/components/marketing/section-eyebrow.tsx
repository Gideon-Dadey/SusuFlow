import { cn } from "@/lib/utils";

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("afrusan-eyebrow mb-4 sm:mb-5", className)}>{children}</p>
  );
}
