import { cn } from "@/lib/utils";

type CompanyPanelProps = {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
};

export function CompanyPanel({
  children,
  className,
  padded = false,
}: CompanyPanelProps) {
  return (
    <section
      className={cn(
        "company-panel",
        padded && "company-panel-padded",
        className,
      )}
    >
      {children}
    </section>
  );
}

type CompanyPanelHeaderProps = {
  title: string;
  action?: React.ReactNode;
  className?: string;
};

export function CompanyPanelHeader({
  title,
  action,
  className,
}: CompanyPanelHeaderProps) {
  return (
    <div className={cn("company-panel-header", className)}>
      <h2 className="company-panel-title">{title}</h2>
      {action}
    </div>
  );
}
