'use client';

import { Button } from '@/components/ui/button';
import { MoneyDisplay } from './money-display';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Printer, X, Receipt } from 'lucide-react';
import { Transaction } from '@/lib/api';

interface ReceiptModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptModal({ transaction, open, onClose }: ReceiptModalProps) {
  if (!open || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDeposit = transaction.type === 'deposit';
  const methodLabel = isDeposit
    ? transaction.payment?.paymentMethod || 'Cash'
    : transaction.withdrawal?.disbursementMethod || 'Cash';
  const phoneLabel = isDeposit
    ? transaction.payment?.paymentMethod ? transaction.payment?.paymentMethod : null
    : transaction.withdrawal?.disbursementPhone || null;

  const formattedAmount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-background/80 backdrop-blur-sm animate-fade-in md:items-center print:bg-white print:p-0 print:static print:block">
      {/* Background click handler */}
      <div className="fixed inset-0 cursor-default" onClick={onClose} />
      
      {/* Card Content Container */}
      <div className="relative z-10 w-full max-w-md my-auto rounded-xl border border-border bg-card p-5 shadow-elevated animate-scale-in print:border-0 print:shadow-none print:p-0 print:static print:block">
        
        {/* Header (Hidden on Print) */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border print:hidden">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Receipt className="h-5 w-5 text-primary" />
            Transaction Receipt
          </div>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="space-y-4 pt-3 print:pt-0">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-border pb-3">
            <h3 className="text-base font-bold text-foreground">SusuFlow Platform</h3>
            <p className="text-[11px] text-muted-foreground">{formatDate(transaction.createdAt)}</p>
          </div>

          {/* Amount Display */}
          <div className="text-center bg-muted/40 rounded-lg py-3 px-4 border border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {isDeposit ? 'Amount Saved' : 'Amount Withdrawn'}
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
                  {transaction.customer.user.firstName} {transaction.customer.user.lastName}
                </span>
              </div>
            ) : null}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold text-foreground capitalize">
                {methodLabel.replace('_', ' ')}
              </span>
            </div>

            {phoneLabel ? (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account / Phone</span>
                <span className="font-mono font-semibold text-foreground">{phoneLabel}</span>
              </div>
            ) : null}

            <div className="flex justify-between border-t border-border pt-2.5">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-semibold text-foreground">{transaction.currency || 'GHS'}</span>
            </div>
          </div>

          {/* Footer Receipt Message */}
          <div className="text-center border-t border-dashed border-border pt-3 space-y-0.5">
            <p className="text-xs text-muted-foreground font-medium">Thank you for saving with SusuFlow!</p>
            <p className="text-[10px] text-muted-foreground/60">This is a system-generated electronic receipt.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex gap-3 print:hidden">
          <Button variant="outline" className="flex-1 flex items-center gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
