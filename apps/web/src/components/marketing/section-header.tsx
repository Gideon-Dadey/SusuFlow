import { cn } from '@/lib/utils';

export function SectionHeader({
  title,
  description,
  align = 'center',
  className,
}: {
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'max-w-3xl xl:max-w-4xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
