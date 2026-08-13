import Image from "next/image";
import {
  LEADERSHIP_FIELD_IMAGE,
  LEADERSHIP_OPS_IMAGE,
} from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";
import { MicroLabel } from "./micro-label";

const PEOPLE = [
  {
    name: "Operations in Kumasi",
    title: "Product & operator success",
    bio: "We sit with susu companies through their first verified collection cycle. Tenant setup, collector roles, and the ledger they will actually use.",
    image: LEADERSHIP_OPS_IMAGE,
    imageAlt:
      "SusuFlow operations lead reviewing collections in a Ghanaian office",
  },
  {
    name: "Field & community",
    title: "Collector workflows",
    bio: "We design for market days, collector routes, and members who pay from their own MoMo wallet. Cash never has to change hands.",
    image: LEADERSHIP_FIELD_IMAGE,
    imageAlt: "SusuFlow field collector helping a saver pay with Mobile Money",
  },
] as const;

export function LeadershipSection() {
  return (
    <section className="bg-white dark:bg-twitter-dark">
      <MarketingContainer className="py-16 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <MicroLabel className="justify-center">A Ghana first team</MicroLabel>
          <h2 className="omnih-h2 mt-4">
            Built beside the operators we serve.
          </h2>
          <p className="omnih-body mx-auto mt-5 max-w-xl">
            {" "}
            We understand collector routes, market day cycles, and the trust
            model that makes susu work. From a single team to multi branch
            companies.{" "}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-12 sm:grid-cols-2">
          {PEOPLE.map((person) => (
            <article key={person.name} className="text-center">
              <div className="mx-auto size-40 overflow-hidden ring-1 ring-black/10 dark:ring-white/20 sm:size-48">
                <Image
                  src={person.image}
                  alt={person.imageAlt}
                  width={192}
                  height={192}
                  className="size-full object-cover"
                />
              </div>
              <h3 className="mt-6 text-xl font-medium text-[#1a1a1a] dark:text-white">
                {person.name}
              </h3>
              <p className="mt-1 text-[13px] text-[var(--ofx-ink-soft)]">
                {person.title}
              </p>
              <p className="omnih-body mx-auto mt-3 max-w-sm">{person.bio}</p>
            </article>
          ))}
        </div>
      </MarketingContainer>
    </section>
  );
}
