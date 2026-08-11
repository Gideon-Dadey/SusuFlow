"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { customerApi } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { CustomerListSkeleton } from "@/components/ui/skeleton";
import { CompanyPageHeader } from "@/components/company-admin/company-page-header";
import { CompanyPanel } from "@/components/company-admin/company-panel";
import { CompanyFilterTabs } from "@/components/company-admin/company-filter-tabs";
import { CompanySearchField } from "@/components/company-admin/company-search-field";

export default function StaffCustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  useEffect(() => {
    const urlStatus = searchParams.get("status");
    setStatus(urlStatus || "");
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-customers", search, status],
    queryFn: () =>
      customerApi.list({
        search: search || undefined,
        status: status || undefined,
      }),
    staleTime: 0,
    refetchOnMount: true,
  });

  const handleExportCsv = () => {
    const items = data?.items || [];
    const headers = [
      "Customer ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Ghana Card",
      "Status",
    ];
    const rows = items.map((c) => [
      c.customerNumber,
      c.user?.firstName || "Pending",
      c.user?.lastName || "Onboarding",
      c.user?.email || "N/A",
      c.user?.phone || "N/A",
      c.ghanaCardNumber || "Not verified",
      c.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customers = (data?.items || []).filter((c) => {
    // Exclude internal company admin & super admin staff from retail customer view
    const email = (c.user?.email || "").toLowerCase();
    return !email.includes("steveamoah@gmail.com");
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus) {
      router.push(`/staff/customers?status=${newStatus}`);
    } else {
      router.push("/staff/customers");
    }
  };

  return (
    <div className="space-y-5">
      <CompanyPageHeader
        title="Customers"
        actions={
          <>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!data?.items?.length}
              className="company-cta-secondary disabled:opacity-50"
            >
              Export
            </button>
            <Link href="/staff/customers/new" className="company-cta-primary">
              Add customer
            </Link>
          </>
        }
      />

      <CompanyFilterTabs
        value={status}
        onChange={handleStatusChange}
        tabs={[
          { label: "All customers", value: "" },
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Suspended", value: "suspended" },
        ]}
      />

      <CompanySearchField
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, phone, or customer ID"
      />

      <CompanyPanel>
        <CardContent className="p-0">
          {isLoading ? (
            <CustomerListSkeleton count={4} />
          ) : customers.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <p className="text-muted-foreground text-xs font-semibold">
                No customers found matching current filters
                {status ? ` (Status: "${status}")` : ""}.
              </p>
              {(status || search) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    handleStatusChange("");
                  }}
                  className="text-xs font-semibold min-h-[36px]"
                >
                  Show All Customers
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {customers.map((c) => (
                <Link
                  key={c.id}
                  href={`/staff/customers/${c.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-semibold text-xs">
                    {c.user?.avatarUrl ? (
                      <img
                        src={c.user.avatarUrl}
                        alt={`${c.user?.firstName || "Customer"} Avatar`}
                        className="size-full object-cover"
                      />
                    ) : (
                      getInitials(c.user?.firstName, c.user?.lastName)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-foreground">
                      {c.user?.firstName || "Pending"}{" "}
                      {c.user?.lastName || "Onboarding"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
                      <span>{c.customerNumber}</span>
                      {c.user?.email && (
                        <span className="truncate">• {c.user.email}</span>
                      )}
                      {c.user?.phone && (
                        <span className="truncate hidden sm:inline">
                          • {c.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={c.status} />
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase font-semibold font-mono">
                      KYC L{c.kycLevel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </CompanyPanel>
    </div>
  );
}
