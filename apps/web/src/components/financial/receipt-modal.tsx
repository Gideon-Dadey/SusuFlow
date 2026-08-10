"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { MoneyDisplay } from "./money-display";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Printer, X, Receipt } from "lucide-react";
import { Transaction, tenantApi } from "@/lib/api";
import {
  getReceiptArtifactHash,
  getReceiptPaymentMethod,
  getReceiptPhoneLabel,
  getReceiptVerifyUrl,
} from "@susuflow/shared";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";

interface ReceiptModalProps {
  transaction: Transaction | null;
  open?: boolean;
  onClose: () => void;
}

export function ReceiptModal({
  transaction,
  open = true,
  onClose,
}: ReceiptModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const { tenantSlug } = useAuthStore();
  const { data: tenantInfo } = useQuery({
    queryKey: ["tenant-branding", transaction?.tenant?.slug || tenantSlug],
    queryFn: () => tenantApi.getBySlug(transaction?.tenant?.slug || tenantSlug),
    enabled: !!(transaction?.tenant?.slug || tenantSlug),
  });

  if (!open || !transaction) return null;
  if (!mounted) return null;

  const companyName =
    transaction.tenant?.name || tenantInfo?.name || "SusuFlow Platform";

  const handlePrint = () => {
    window.print();
  };

  const isDeposit = transaction.type === "deposit";
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://susuflow.com";
  const verifyUrl = getReceiptVerifyUrl(transaction, origin);
  const methodLabel = getReceiptPaymentMethod(transaction);
  const phoneLabel = getReceiptPhoneLabel(transaction);

  const formattedAmount =
    typeof transaction.amount === "string"
      ? parseFloat(transaction.amount)
      : transaction.amount;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto p-0 sm:p-4 bg-background/80 backdrop-blur-sm animate-fade-in print:bg-white print:p-0 print:static print:block">
      {/* Background click handler */}
      <div
        className="fixed inset-0 cursor-default print:hidden"
        onClick={onClose}
      />

      {/* Card Content Container */}
      <div className="relative z-10 w-full sm:max-w-md rounded-none sm:rounded-xl border-x-0 sm:border-x border-t sm:border border-border/60 bg-card p-4 sm:p-5 shadow-elevated animate-scale-in print:border-0 print:shadow-none print:p-0 print:static print:block print:max-w-none">
        {/* Header (Hidden on Print) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border print:hidden">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction Receipt
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="w-full">
          {/* Screen-Only Modal Content */}
          <div className="print:hidden space-y-4 pt-3">
            {/* Header */}
            <div className="text-center space-y-1 border-b border-dashed border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                {companyName}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {formatDate(transaction.createdAt)}
              </p>
            </div>

            {/* Amount Display */}
            <div className="text-center bg-muted/40 rounded-lg py-3 px-4 border border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {isDeposit ? "Amount Saved" : "Amount Withdrawn"}
              </p>
              <div className="mt-1 flex justify-center text-foreground font-bold">
                <MoneyDisplay amount={formattedAmount} size="lg" />
              </div>
              <div className="mt-1.5 flex justify-center">
                <StatusBadge status={transaction.status} />
              </div>
            </div>

            {/* Transaction Metadata Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs font-semibold text-foreground uppercase">
                  {transaction.reference}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Type</span>
                <span className="font-semibold text-foreground capitalize">
                  {transaction.type}
                </span>
              </div>

              {transaction.customer?.user ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-semibold text-foreground">
                    {transaction.customer.user.firstName}
                    {""}
                    {transaction.customer.user.lastName}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-semibold text-foreground capitalize">
                  {methodLabel.replace("_", "")}
                </span>
              </div>

              {phoneLabel ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account / Phone</span>
                  <span className="font-mono font-semibold text-foreground">
                    {phoneLabel}
                  </span>
                </div>
              ) : null}

              <div className="flex justify-between border-t border-border pt-2.5">
                <span className="text-muted-foreground">Currency</span>
                <span className="font-semibold text-foreground">
                  {transaction.currency || "GHS"}
                </span>
              </div>
            </div>

            {/* Footer Receipt Message */}
            <div className="text-center border-t border-dashed border-border pt-3 space-y-0.5">
              <p className="text-xs text-muted-foreground font-medium">
                Thank you for saving with SusuFlow!
              </p>
              <p className="text-[10px] text-muted-foreground/60">
                This is a system-generated electronic receipt.
              </p>
            </div>
          </div>

          {/* Print-Only Professional Document Content */}
          <div className="hidden print:block space-y-8 text-black bg-white w-full text-sm">
            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-primary mb-6" />

            {/* Centered Organization Title */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-extrabold uppercase tracking-wider text-foreground">
                {companyName}
              </h1>
              <h2 className="text-sm font-bold tracking-widest text-gray-800 border-b-2 border-gray-900 pb-1.5 inline-block px-4">
                PAYMENT RECEIPT / INVOICE
              </h2>
            </div>

            {/* Key-Value Details Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 pt-6 text-[13px]">
              {/* Left Column */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Customer Name:
                  </span>
                  <span className="font-bold text-gray-900">
                    {transaction.customer?.user
                      ? `${transaction.customer.user.firstName} ${transaction.customer.user.lastName}`
                      : "Susu Member"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Invoice / Ref #:
                  </span>
                  <span className="font-mono font-medium text-gray-900">
                    {transaction.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Receipt Code:
                  </span>
                  <span className="font-mono font-semibold text-gray-900">
                    {transaction.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Payment Method:
                  </span>
                  <span className="font-bold text-gray-900 uppercase">
                    {methodLabel.replace("_", "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Payment Time:
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Customer ID:
                  </span>
                  <span className="font-mono font-medium text-gray-900">
                    {transaction.customer?.customerNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Transaction Type:
                  </span>
                  <span className="font-bold text-gray-900 uppercase">
                    {transaction.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Payment Status:
                  </span>
                  <span className="font-bold text-foreground uppercase">
                    {transaction.status === "completed"
                      ? "PAID"
                      : transaction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-500">
                    Payment Ref:
                  </span>
                  <span className="font-mono font-medium text-gray-900">
                    {transaction.reference.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="pt-6">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-border/60">
                    <th className="py-2.5 px-4 font-bold text-gray-700 w-12 text-left">
                      No.
                    </th>
                    <th className="py-2.5 px-4 font-bold text-gray-700 text-left">
                      Service
                    </th>
                    <th className="py-2.5 px-4 font-bold text-gray-700 w-16 text-right">
                      Qty
                    </th>
                    <th className="py-2.5 px-4 font-bold text-gray-700 w-28 text-right">
                      Unit
                    </th>
                    <th className="py-2.5 px-4 font-bold text-gray-700 w-28 text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-b border-border/60">
                  <tr>
                    <td className="py-3 px-4 text-left text-gray-600">1</td>
                    <td className="py-3 px-4 font-medium text-gray-900 text-left">
                      {isDeposit
                        ? "Susu Gateway-Confirmed Deposit Contribution"
                        : "Susu Ledger-Authorized Account Cash Payout"}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800">1</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-800">
                      GH¢ {formattedAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900">
                      GH¢ {formattedAmount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary Block */}
            <div className="flex justify-end pt-4">
              <div className="w-80 space-y-2 text-[13px]">
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Total Bill:</span>
                  <span className="font-mono">
                    GH¢ {formattedAmount.toFixed(2)}
                  </span>
                </div>

                {/* Solid Pill block for Paid Status */}
                <div className="flex justify-between items-center bg-primary text-white rounded-lg px-4 py-2 font-bold text-sm">
                  <span>Paid:</span>
                  <span className="font-mono">
                    GH¢ {formattedAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Balance:</span>
                  <span className="font-mono">GH¢ 0.00</span>
                </div>
              </div>
            </div>

            {/* Verification and QR Code section */}
            <div className="flex gap-6 items-start border-t border-border/60 pt-6 mt-8">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`}
                alt="Verification QR Code"
                className="h-28 w-28 border border-border/60 p-1.5 bg-white shrink-0"
              />
              <div className="space-y-1.5 text-xs text-gray-600 pt-1.5">
                <p className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">
                  Verification Details
                </p>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">
                    Verification URL
                  </p>
                  <p className="font-mono text-gray-500 break-all">
                    {verifyUrl}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Artifact SHA-256:{""}
                    <span className="font-mono">
                      {getReceiptArtifactHash(transaction.reference)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Fine print footer */}
            <div className="border-t border-border/60 pt-4 mt-8 text-center text-[10px] text-gray-400">
              Issued by {transaction.tenant?.name || "SusuFlow Platform"}.
              Printed on {new Date().toLocaleDateString("en-US")},{""}
              {new Date().toLocaleTimeString("en-US")}. Official receipt
              timestamp {formatDate(transaction.createdAt)}.
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-3 print:hidden">
          <Button
            variant="outline"
            className="flex-1 flex items-center gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
