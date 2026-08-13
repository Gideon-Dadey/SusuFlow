import Image from "next/image";
import type { Icon } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";

export interface PhotoColumnItem {
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  icon: Icon;
}

export function PhotoColumns({
  items,
  className,
}: {
  items: PhotoColumnItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-[28rem] md:grid-cols-2",
        items.length === 3 && "lg:grid-cols-3",
        items.length >= 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {items.map(({ title, body, image, imageAlt, icon: Icon }) => (
        <article key={title} className="relative min-h-[22rem] overflow-hidden">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
            <Icon className="h-7 w-7 text-white" aria-hidden />
            <h3 className="mt-5 text-xl font-medium text-white md:text-2xl">
              {title}
            </h3>
            <div className="omnih-glass relative mt-4 p-4">
              <span className="absolute left-2 top-2 h-1.5 w-1.5 bg-white" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-white" />
              <span className="absolute bottom-2 left-2 h-1.5 w-1.5 bg-white" />
              <span className="absolute bottom-2 right-2 h-1.5 w-1.5 bg-white" />
              <p className="text-sm leading-relaxed text-white/85">{body}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
