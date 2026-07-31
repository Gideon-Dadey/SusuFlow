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
      <h2 className="sr-section-bar text-balance text-foreground">{title}</h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
