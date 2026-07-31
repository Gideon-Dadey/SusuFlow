"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { withdrawalApi, Transaction } from "@/lib/api";
import { formatGhs, formatDate } from "@/lib/utils";
import { TransactionListSkeleton } from "@/components/ui/skeleton";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { ArrowUpRight } from "lucide-react";

export default function StaffWithdrawalsPage() {
  const queryClient = useQueryClient();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["staff-withdrawals"],
    queryFn: () => withdrawalApi.list(),
    placeholderData: (prev) => prev,
  });

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoading(id);
    setError("");
    try {
      await withdrawalApi.approveWithdrawal(id);
      queryClient.invalidateQueries({ queryKey: ["staff-withdrawals"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const reason = prompt("Please enter the reason for rejection:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Rejection reason is required.");
      return;
    }
    setActionLoading(id);
    setError("");
    try {
      await withdrawalApi.rejectWithdrawal(id, reason);
      queryClient.invalidateQueries({ queryKey: ["staff-withdrawals"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setActionLoading(null);
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
      t.withdrawal?.disbursementMethod || "momo",
      t.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `withdrawals_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const withdrawals = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">Withdrawals</h1>
        </div>
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
        <CardContent className="p-0">
          {isLoading ? (
            <TransactionListSkeleton count={5} />
          ) : withdrawals.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No withdrawals recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-border/40">
              {withdrawals.map((t) => {
                const amt =
                  typeof t.amount === "string"
                    ? parseFloat(t.amount)
                    : t.amount;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTxn(t);
                      setReceiptOpen(true);
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">
                        {t.customer?.user
                          ? `${t.customer.user.firstName} ${t.customer.user.lastName}`
                          : "Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-sm text-red-600">
                          -{formatGhs(amt)}
                        </p>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                          {t.reference}
                        </span>
                        <div className="mt-1 flex justify-end">
                          <StatusBadge status={t.status} />
                        </div>
                      </div>
                      {t.status === "pending" && (
                        <div className="flex gap-1.5 ml-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-medium px-3"
                            loading={actionLoading === t.id}
                            onClick={(e) => handleApprove(e, t.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium px-3"
                            loading={actionLoading === t.id}
                            onClick={(e) => handleReject(e, t.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal
        transaction={selectedTxn}
        open={receiptOpen}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
}
