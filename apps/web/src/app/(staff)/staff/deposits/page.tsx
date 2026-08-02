"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { depositApi, type Transaction } from "@/lib/api";
import { formatGhs, formatDate } from "@/lib/utils";
import { TransactionListSkeleton } from "@/components/ui/skeleton";

export default function StaffDepositsPage() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

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

  const handleVerify = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
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

  const deposits = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-title">All Deposits</h1>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportCsv}
          className="text-xs font-semibold"
          disabled={!deposits.length}
        >
          Download CSV
        </Button>
      </div>

      <Card className="rounded-none border border-border/60 bg-card shadow-sm p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <TransactionListSkeleton count={5} />
          </div>
        ) : deposits.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No deposit transactions recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {deposits.map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  setSelectedTxn(tx);
                  setReceiptOpen(true);
                }}
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-muted/20 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-foreground tracking-tight">
                      {tx.reference}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {tx.customer?.user
                      ? `${tx.customer.user.firstName} ${tx.customer.user.lastName}`
                      : "Susu Member"}{" "}
                    · {tx.customer?.customerNumber || "N/A"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <p className="text-sm font-bold tabular-nums text-foreground">
                      {formatGhs(tx.amount)}
                    </p>
                  </div>
                  {tx.status === "pending" && (
                    <Button
                      size="sm"
                      className="font-semibold text-xs py-1 px-3 h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                      loading={confirmingId === tx.id}
                      onClick={(e) => handleVerify(e, tx.id)}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ReceiptModal
        transaction={selectedTxn}
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
      />
    </div>
  );
}
