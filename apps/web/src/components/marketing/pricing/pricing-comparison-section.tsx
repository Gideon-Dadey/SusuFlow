import { Fragment } from "react";
import Link from "next/link";
import { Check, X } from "@/components/icons/phosphor";
import {
  PRICING_COMPARISON_GROUPS,
  PRICING_PLANS,
  type PricingCellValue,
} from "@/lib/marketing-data";
import { cn } from "@/lib/utils";
import { MarketingContainer } from "../marketing-container";

const PLAN_KEYS = ["starter", "growth", "enterprise"] as const;

function CellValue({ value }: { value: PricingCellValue }) {
  if (value === true) {
    return (
      <Check
        className="mx-auto h-5 w-5 text-[var(--ofx-flame)]"
        aria-label="Included"
      />
    );
  }
  if (value === false) {
    return (
      <X
        className="mx-auto h-5 w-5 text-muted-foreground/40"
        aria-label="Not included"
      />
    );
  }
  return (
    <span className="text-[15px] font-medium text-foreground">{value}</span>
  );
}

export function PricingComparisonSection() {
  return (
    <section id="compare" className="scroll-mt-24 bg-[var(--ofx-paper)]">
      <MarketingContainer className="ofx-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="ofx-eyebrow">Compare plans</p>
          <h2 className="ofx-h2 mt-4">Every feature, side by side</h2>
          <p className="ofx-lead mx-auto mt-5 max-w-2xl">
            All plans start with verified MoMo collections. Higher tiers add
            scale, team controls and deeper support.
          </p>
        </div>

        {/* Desktop table */}
        <div className="mt-12 hidden overflow-hidden border border-border/70 bg-white lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="w-[40%] px-8 py-7 align-bottom" />
                  {PRICING_PLANS.map((plan) => (
                    <th
                      key={plan.name}
                      className="px-4 py-7 text-center align-bottom"
                    >
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        {plan.name}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {plan.price}
                        {plan.period ? ` ${plan.period}` : ""}
                      </p>
                      <Link
                        href={plan.ctaHref}
                        className={cn(
                          "mt-4 inline-flex",
                          plan.highlighted
                            ? "ofx-btn ofx-btn-dark ofx-btn-sm"
                            : "ofx-btn ofx-btn-outline ofx-btn-sm",
                        )}
                      >
                        {plan.highlighted ? "Try it free" : plan.cta}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRICING_COMPARISON_GROUPS.map((group) => (
                  <Fragment key={group.category}>
                    <tr className="bg-[var(--ofx-cream)]/60">
                      <td colSpan={4} className="px-8 py-4">
                        <span className="ofx-eyebrow">{group.category}</span>
                      </td>
                    </tr>
                    {group.rows.map((row, rowIdx) => (
                      <tr
                        key={row.feature}
                        className={cn(
                          rowIdx < group.rows.length - 1 &&
                            "border-b border-border/50",
                        )}
                      >
                        <td className="px-8 py-5 text-[15px] text-foreground">
                          {row.feature}
                        </td>
                        {PLAN_KEYS.map((key) => (
                          <td key={key} className="px-4 py-5 text-center">
                            <CellValue value={row[key]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile stacked cards */}
        <div className="mt-10 flex flex-col gap-6 lg:hidden">
          {PRICING_PLANS.map((plan, planIdx) => {
            const planKey = PLAN_KEYS[planIdx];
            return (
              <div key={plan.name} className="ofx-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.price}
                      {plan.period ? ` ${plan.period}` : ""}
                    </p>
                  </div>
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      plan.highlighted
                        ? "ofx-btn ofx-btn-dark ofx-btn-sm"
                        : "ofx-btn ofx-btn-outline ofx-btn-sm",
                    )}
                  >
                    {plan.highlighted ? "Try it free" : plan.cta}
                  </Link>
                </div>
                {PRICING_COMPARISON_GROUPS.map((group) => (
                  <div key={group.category} className="mt-6">
                    <p className="ofx-eyebrow">{group.category}</p>
                    <ul className="mt-3 divide-y divide-border/50">
                      {group.rows.map((row) => (
                        <li
                          key={row.feature}
                          className="flex items-center justify-between gap-3 py-3 text-[15px]"
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
