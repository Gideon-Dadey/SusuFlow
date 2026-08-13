import Image from "next/image";
import Link from "next/link";
import type { ResourceArticle } from "@/lib/marketing-data";

export function ResourceArticleCard({
  article,
  href = "/resources",
  image,
  imageAlt,
}: {
  article: ResourceArticle;
  href?: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <Link
      href={href}
      className="group grid aspect-square grid-rows-2 bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.10)] dark:bg-twitter-dark dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
    >
      <div className="relative min-h-0 overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex min-h-0 flex-col items-center justify-center overflow-hidden px-5 text-center">
        <p className="text-[13px] text-slate-600 dark:text-slate-400">
          {article.category} | {article.date} | {article.readTime}
        </p>
        <h3 className="mt-3 text-xl font-medium leading-snug tracking-tight text-[#1a1a1a] dark:text-white">
          {article.title}
        </h3>
        <span
          className="mx-auto mt-4 block h-px w-10 bg-[var(--ofx-flame)] dark:bg-white/25"
          aria-hidden
        />
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {article.excerpt}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
