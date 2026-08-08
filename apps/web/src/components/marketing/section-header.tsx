import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  align = "center",
  className,
}: {
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl xl:max-w-4xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <h2 className="afrusan-section-title text-balance">{title}</h2>
      {description ? <p className="afrusan-body mt-4">{description}</p> : null}
    </div>
  );
}
