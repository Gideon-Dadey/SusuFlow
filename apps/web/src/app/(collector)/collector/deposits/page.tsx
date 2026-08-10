"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionRow } from "@/components/financial/transaction-row";
import { ReceiptModal } from "@/components/financial/receipt-modal";
import { depositApi, type Transaction } from "@/lib/api";

export default function CollectorDepositsPage() {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["collector-deposits", statusFilter],
    queryFn: () => depositApi.list({ status: statusFilter || undefined }),
  });

  const transactions = data?.items || [];

  return (
    <div className="space-y-6">
      <h1 className="dashboard-title">History</h1>

      <div className="flex gap-2 flex-wrap">
        {["", "pending", "completed", "failed"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1 text-xs font-medium border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {transactions.length} collections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-40 animate-pulse bg-muted/50 m-4 rounded-lg" />
          ) : transactions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No collections found
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTxn(t);
                    setReceiptOpen(true);
                  }}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <TransactionRow transaction={t} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReceiptModal
        transaction={selectedTxn}
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          setSelectedTxn(null);
        }}
      />
    </div>
  );
}
