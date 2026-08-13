"use client";

import { useState } from "react";
import Image from "next/image";
import { APP_NAME, HOME_CAPABILITY_TABS } from "@/lib/marketing-data";
import { BRAND_PLATFORM_OVERVIEW } from "@/lib/brand-assets";
import { MarketingContainer } from "./marketing-container";
import { SectionEyebrow } from "./section-eyebrow";
import { cn } from "@/lib/utils";

export function CapabilitiesTabsSection() {
  const [activeId, setActiveId] = useState<string>(HOME_CAPABILITY_TABS[0].id);
  const activeTab =
    HOME_CAPABILITY_TABS.find((tab) => tab.id === activeId) ??
    HOME_CAPABILITY_TABS[0];

  return (
    <section className="afrusan-section afrusan-warm-section">
      <MarketingContainer>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
          <div>
            <SectionEyebrow>Built for susu</SectionEyebrow>
            <h2 className="afrusan-section-title">
              {APP_NAME} offers end to end tools across every stage of
              operations:
            </h2>

            <div className="mt-8 flex flex-col gap-1">
              {HOME_CAPABILITY_TABS.map((tab) => {
                const isActive = tab.id === activeId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveId(tab.id)}
                    className={cn(
                      "px-4 py-3 text-left text-base font-medium transition-colors",
                      isActive
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-w-0">
            <div className="bg-card/80 p-6 sm:p-8">
              <h3 className="font-geist text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl">
                {activeTab.title}
              </h3>
              <p className="afrusan-body mt-4">{activeTab.description}</p>
            </div>

            <div className="relative mt-8 aspect-[4/3] overflow-hidden">
              <Image
                src={BRAND_PLATFORM_OVERVIEW}
                alt="SusuFlow platform dashboard"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
