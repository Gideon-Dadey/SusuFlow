import { cn } from "@/lib/utils";

export type CompanyFilterTab = {
  label: string;
  value: string;
  count?: number;
};

type CompanyFilterTabsProps = {
  tabs: CompanyFilterTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function CompanyFilterTabs({
  tabs,
  value,
  onChange,
  className,
}: CompanyFilterTabsProps) {
  return (
    <div className={cn("company-filter-tabs", className)} role="tablist">
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn("company-filter-tab", active && "is-active")}
          >
            <span>{tab.label}</span>
            {tab.count != null ? (
              <span className="company-filter-count">{tab.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
