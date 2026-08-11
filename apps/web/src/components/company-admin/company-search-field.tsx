import { Search } from "@/components/icons/phosphor";
import { cn } from "@/lib/utils";

type CompanySearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function CompanySearchField({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: CompanySearchFieldProps) {
  return (
    <label className={cn("company-search", className)}>
      <Search className="company-search-icon" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="company-search-input"
      />
    </label>
  );
}
