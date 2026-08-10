import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { APP_NAME } from "@/lib/marketing-data";

export function TeamPreviewSection() {
  return (
    <section className="grid lg:grid-cols-2">
      <div className="marketing-band-height relative">
        <Image
          src="/images/home/solutions-in-action.png"
          alt="SusuFlow team supporting Ghanaian susu operators"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center"
          priority={false}
        />
      </div>

      <div className="marketing-band-height afrusan-warm-section flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20">
        <h2 className="afrusan-section-title text-balance">Our Team</h2>
        <p className="afrusan-body mt-5 max-w-lg text-pretty">
          With deep experience in Ghanaian susu operations, mobile money
          integrations, and enterprise fintech, the {APP_NAME} team delivers
          reliable collection workflows and is dedicated to ensuring your
          company, collectors, and members are always in the best hands.
        </p>
        <Link
          href="/about"
          className="mt-8 inline-flex w-fit items-center gap-3 bg-primary px-5 py-2.5 pl-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:text-base"
        >
          <span>View team</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      </div>
    </section>
  );
}
