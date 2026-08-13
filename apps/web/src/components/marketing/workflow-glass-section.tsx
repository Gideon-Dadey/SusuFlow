import Image from "next/image";
import { HOME_WORKFLOW_IMAGE } from "@/lib/brand-assets";
import { HOME_CAPABILITY_TABS } from "@/lib/marketing-data";
import { MarketingContainer } from "./marketing-container";
import { GlassCard } from "./glass-card";
import { MicroLabel } from "./micro-label";

const CARDS = HOME_CAPABILITY_TABS.slice(0, 4);

export function WorkflowGlassSection({
  image = HOME_WORKFLOW_IMAGE,
  label = "Platform capabilities",
  title = "From the stall to the ledger, in one verified path.",
  body = "Collectors prompt. Members pay from their own MoMo wallet. The gateway confirms. The books update. Nothing is recorded until the money is real.",
}: {
  image?: string;
  label?: string;
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden py-16 md:py-28">
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/50" />

      <MarketingContainer className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div className="max-w-lg">
            <MicroLabel onPhoto>{label}</MicroLabel>
            <h2 className="omnih-h2 mt-4 text-white">{title}</h2>
            <p className="mt-5 text-sm leading-relaxed text-white/80 sm:text-base">
              {body}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CARDS.map((card, i) => (
              <GlassCard
                key={card.id}
                index={String(i + 1).padStart(2, "0")}
                title={card.title}
                body={card.description}
              />
            ))}
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
