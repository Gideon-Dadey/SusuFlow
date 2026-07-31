"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionRow } from "@/components/financial/transaction-row";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { depositApi } from "@/lib/api";
import { TransactionListSkeleton } from "@/components/ui/skeleton";

export default function StaffDepositsPage() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["staff-deposits"],
    queryFn: () => depositApi.list(),
    placeholderData: (prev) => prev,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => depositApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-deposits"] });
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : "Verification failed");
    },
  });

  const handleVerify = async (id: string) => {
    setConfirmingId(id);
    try {
      await confirmMutation.mutateAsync(id);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleExportCsv = () => {
    const items = data?.items || [];
    const headers = [
      "Date",
      "Reference",
      "Customer Name",
      "Amount (GHS)",
      "Method",
      "Status",
    ];
    const rows = items.map((t) => [
      new Date(t.createdAt).toLocaleDateString(),
      t.reference,
      t.customer?.user
        ? `"${t.customer.user.firstName} ${t.customer.user.lastName}"`
        : "N/A",
      t.amount,
      t.payment?.paymentMethod || "momo",
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `deposits_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">All Deposits</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          className="text-xs font-semibold"
          disabled={!data?.items?.length}
        >
          Download CSV
        </Button>
      </div>
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : (
            (data?.items || []).map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                action={
                  t.status === "pending" ? (
                    <Button
                      size="sm"
                      className="font-semibold text-xs py-1 px-3 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      loading={confirmingId === t.id}
                      onClick={() => handleVerify(t.id)}
                    >
                      Verify
                    </Button>
                  ) : undefined
                }
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
