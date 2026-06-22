import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { MoneyDisplay } from './money-display';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import type { Transaction } from '@/lib/api';

export function TransactionRow({ 
  transaction, 
  action 
}: { 
  transaction: Transaction; 
  action?: React.ReactNode; 
}) {
  const isDeposit = transaction.type === 'deposit';
  const amount = Number(transaction.amount);

  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isDeposit ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
        }`}
      >
        {isDeposit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {isDeposit ? 'Deposit' : transaction.type}
          {transaction.payment?.paymentMethod
            ? ` · ${transaction.payment.paymentMethod.replace('_', ' ')}`
            : ''}
        </p>
        <p className="text-xs text-muted-foreground">{formatDate(transaction.createdAt)}</p>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div>
          <MoneyDisplay
            amount={amount}
            type={isDeposit ? 'credit' : 'debit'}
            showSign
            size="sm"
          />
          <div className="mt-1 flex justify-end">
            <StatusBadge status={transaction.status} />
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}
