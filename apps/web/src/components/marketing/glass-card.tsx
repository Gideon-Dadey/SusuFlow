import { cn } from "@/lib/utils";

export function GlassCard({
  index,
  title,
  body,
  className,
}: {
  index: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <article className={cn("omnih-glass relative p-6 sm:p-7", className)}>
      <span className="absolute left-3 top-3 h-1.5 w-1.5 bg-white" />
      <span className="absolute right-3 top-3 h-1.5 w-1.5 bg-white" />
      <span className="absolute bottom-3 left-3 h-1.5 w-1.5 bg-white" />
      <span className="absolute bottom-3 right-3 h-1.5 w-1.5 bg-white" />
      <p className="text-3xl font-semibold tracking-tight text-white/80">
        {index}
      </p>
      <h3 className="mt-4 text-xl font-medium text-white md:text-2xl">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
        {body}
      </p>
    </article>
  );
}
