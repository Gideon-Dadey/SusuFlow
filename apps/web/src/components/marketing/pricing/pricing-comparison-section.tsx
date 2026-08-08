import { Fragment } from "react";
import Link from "next/link";
import { Minus } from "lucide-react";
import {
  PRICING_COMPARISON_GROUPS,
  PRICING_PLANS,
  type PricingCellValue,
} from "@/lib/marketing-data";
import { Button } from "@/components/ui/button";
import { MarketingContainer } from "../marketing-container";
import { SectionEyebrow } from "../section-eyebrow";
import { PricingCheckIcon } from "./pricing-check-icon";
import { cn } from "@/lib/utils";

function CellValue({ value }: { value: PricingCellValue }) {
  if (value === true) {
    return (
      <span className="inline-flex justify-center" aria-label="Included">
        <PricingCheckIcon size="sm" />
      </span>
    );
  }
  if (value === false) {
    return (
      <Minus
        className="mx-auto size-5 text-muted-foreground/40"
        aria-label="Not included"
      />
    );
  }
  return <span className="text-base font-medium text-foreground">{value}</span>;
}

const PLAN_KEYS = ["starter", "growth", "enterprise"] as const;

const COMPARISON_ROW_EVEN = "bg-card";
const COMPARISON_ROW_ODD = "bg-muted/50 dark:bg-muted/30";
const COMPARISON_GROUP_HEADER =
  "border-t border-border bg-primary px-4 py-3 text-base font-medium text-primary-foreground";

export function PricingComparisonSection() {
  return (
    <section id="compare" className="scroll-mt-24 bg-background">
      <MarketingContainer className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow className="text-center">Compare plans</SectionEyebrow>
          <h2 className="afrusan-section-title text-balance">
            Compare all features across the plans
          </h2>
          <p className="afrusan-body mx-auto mt-5 max-w-2xl text-pretty">
            Every plan includes verified MoMo collections. Higher tiers add
            scale, team controls, and support for growing susu companies.
          </p>
        </div>

        <div className="mt-10 hidden overflow-x-auto rounded-2xl border border-border lg:mt-14 lg:block">
          <table className="w-full min-w-[48rem] border-collapse text-left">
            <thead className="bg-card">
              <tr>
                <th className="w-[40%] pb-6 pr-6 align-bottom" />
                {PRICING_PLANS.map((plan) => (
                  <th
                    key={plan.name}
                    className="px-4 pb-6 text-center align-bottom"
                  >
                    <p className="font-geist text-base font-medium text-foreground">
                      {plan.name}
                    </p>
                    <Link href={plan.ctaHref} className="mt-4 inline-block">
                      <Button
                        variant={plan.highlighted ? "primary" : "outline"}
                        size="sm"
                        className="h-10 min-w-[8.5rem] rounded-full font-medium"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let rowIndex = 0;
                return PRICING_COMPARISON_GROUPS.map((group) => (
                  <Fragment key={group.category}>
                    <tr>
                      <td colSpan={4} className={COMPARISON_GROUP_HEADER}>
                        {group.category}
                      </td>
                    </tr>
                    {group.rows.map((row) => {
                      const striped = rowIndex % 2 === 1;
                      rowIndex += 1;
                      return (
                        <tr
                          key={row.feature}
                          className={cn(
                            "border-b border-border/40",
                            striped ? COMPARISON_ROW_ODD : COMPARISON_ROW_EVEN,
                          )}
                        >
                          <td className="py-4 pr-6 text-base text-foreground">
                            {row.feature}
                          </td>
                          {PLAN_KEYS.map((key) => (
                            <td key={key} className="px-4 py-4 text-center">
                              <CellValue value={row[key]} />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </Fragment>
                ));
              })()}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-col gap-6 lg:hidden">
          {PRICING_PLANS.map((plan) => {
            const planKey =
              plan.name.toLowerCase() as (typeof PLAN_KEYS)[number];
            return (
              <div
                key={plan.name}
                className={cn(
                  "afrusan-card p-5",
                  plan.highlighted && "ring-2 ring-[#c6e5df]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-geist text-lg font-medium text-foreground">
                    {plan.name}
                  </h3>
                  <Link href={plan.ctaHref}>
                    <Button
                      variant={plan.highlighted ? "primary" : "outline"}
                      size="sm"
                      className="h-9 rounded-full font-medium"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
                {PRICING_COMPARISON_GROUPS.map((group) => (
                  <div key={group.category} className="mt-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {group.category}
                    </p>
                    <ul className="mt-3 divide-y divide-border/40 overflow-hidden rounded-xl border border-border bg-card">
                      {group.rows.map((row, rowIdx) => (
                        <li
                          key={row.feature}
                          className={cn(
                            "flex items-center justify-between gap-3 px-3 py-2.5 text-base",
                            rowIdx % 2 === 1
                              ? COMPARISON_ROW_ODD
                              : COMPARISON_ROW_EVEN,
                          )}
                        >
                          <span className="text-foreground">{row.feature}</span>
                          <span className="shrink-0 text-right">
                            <CellValue value={row[planKey]} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </MarketingContainer>
    </section>
  );
}
