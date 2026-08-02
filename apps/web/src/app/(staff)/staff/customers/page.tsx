"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { customerApi } from "@/lib/api";
import { getInitials, cn } from "@/lib/utils";
import Link from "next/link";
import { CustomerListSkeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="dashboard-title">Customers</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="text-xs font-semibold rounded-none min-h-[36px]"
            disabled={!data?.items?.length}
          >
            Download CSV
          </Button>
          <Link href="/staff/customers/new">
            <Button className="flex items-center gap-1.5 font-semibold text-xs rounded-none min-h-[36px] bg-primary text-primary-foreground hover:bg-primary/95">
              <Plus className="h-3.5 w-3.5" />
              Onboard Customer
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        {[
          { label: "All Customers", value: "" },
          { label: "Active", value: "active" },
          { label: "Pending", value: "pending" },
          { label: "Suspended", value: "suspended" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-none border-b-2 transition-colors",
              status === tab.value
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-none border border-border/60 bg-card text-foreground focus:outline-none focus:border-primary min-h-[38px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="py-2 px-3 text-xs rounded-none border border-border/60 bg-card text-foreground focus:outline-none focus:border-primary min-h-[38px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
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
                  className="text-xs font-semibold rounded-none min-h-[36px]"
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
      </Card>
    </div>
  );
}
