'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faClipboardList,
  faHandshake,
  faStore,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { AUDIENCE_TABS } from '@/lib/marketing-data';
import { cn } from '@/lib/utils';
import { MarketingContainer } from './marketing-container';

const TAB_ICONS: IconDefinition[] = [
  faBriefcase,
  faUsers,
  faStore,
  faHandshake,
  faClipboardList,
];

export function AudiencesSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = AUDIENCE_TABS[activeIndex]!;

  useEffect(() => {
    tabRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex]);

  return (
    <section className="marketing-section border-t border-border bg-background">
      <MarketingContainer>
        <div
          role="tablist"
          aria-label="Who SusuFlow is for"
          className="audience-tablist flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:justify-center sm:gap-3 sm:px-1 lg:gap-0"
        >
          {AUDIENCE_TABS.map((tab, index) => {
            const icon = TAB_ICONS[index]!;
            const isActive = index === activeIndex;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`audience-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`audience-panel-${tab.id}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'audience-tab flex w-[6.75rem] shrink-0 snap-center flex-col items-center gap-2 px-1 py-2 text-center transition-colors sm:w-[8.5rem] sm:px-3 lg:w-auto lg:min-w-0 lg:flex-1 lg:px-4',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full transition-colors sm:size-11',
                    isActive ? 'bg-primary/12 text-primary' : 'bg-muted/80 text-muted-foreground',
                  )}
                >
                  <FontAwesomeIcon icon={icon} className="h-[1.125rem] w-[1.125rem] sm:h-5 sm:w-5" aria-hidden />
                </span>
                <span
                  className={cn(
                    'w-full text-pretty text-[0.6875rem] font-medium leading-snug sm:text-xs lg:text-sm',
                    isActive && 'font-semibold',
                  )}
                >
                  {tab.title}
                </span>
                <span
                  className={cn(
                    'h-0.5 w-10 rounded-full bg-primary transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`audience-panel-${active.id}`}
          aria-labelledby={`audience-tab-${active.id}`}
          className="audience-panel relative mt-8 overflow-hidden rounded-2xl sm:mt-10 lg:rounded-3xl"
        >
          <div className="relative aspect-[4/3] min-h-[18rem] sm:aspect-[16/9] sm:min-h-[22rem] lg:min-h-[28rem]">
            <Image
              key={active.id}
              src={active.image}
              alt={active.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              className={cn('animate-fade-in object-cover', active.imagePosition)}
              priority
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10"
              aria-hidden
            />
          </div>

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-auto sm:left-6 sm:top-6 sm:max-w-md lg:left-8 lg:top-8">
            <div
              key={active.id}
              className="audience-overlay-card animate-fade-in rounded-2xl p-5 sm:p-6"
            >
              <h3 className="text-lg font-bold tracking-tight sm:text-xl">{active.title}</h3>
              <p className="mt-2 text-sm leading-relaxed sm:text-[0.9375rem]">{active.description}</p>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
