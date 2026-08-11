"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerApi } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { OnboardCustomerForm } from "@/components/collector/onboard-customer-form";
import { Plus, Search, Wallet } from "@/components/icons/phosphor";

export default function CollectorCustomersPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["collector-customers", search],
    queryFn: () => customerApi.list({ search: search || undefined }),
  });

  const customers = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="dashboard-title">Customers</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <OnboardCustomerForm
          onSuccess={() => {
            setShowForm(false);
            refetch();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or customer ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted/60" />
      ) : customers.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No customers assigned yet
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4" />
            Onboard your first customer
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <Card
              key={c.id}
              className="hover:border-primary/30 transition-colors"
            >
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {getInitials(c.user?.firstName, c.user?.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {c.user?.firstName || "Pending"}{" "}
                      {c.user?.lastName || "Onboarding"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {c.customerNumber}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.user?.phone || c.user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={c.status} />
                  <Link href={`/collector/deposit?customer=${c.id}`}>
                    <Button size="sm" variant="outline" className="gap-1 h-8">
                      <Wallet className="h-3.5 w-3.5" />
                      Collect
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
