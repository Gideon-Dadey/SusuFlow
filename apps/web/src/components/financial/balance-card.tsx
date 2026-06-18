import { Card, CardContent } from '@/components/ui/card';
import { MoneyDisplay } from './money-display';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface BalanceCardProps {
  balance: number;
  todayChange?: number;
  depositHref?: string;
}

export function BalanceCard({ balance, todayChange, depositHref = '/deposit' }: BalanceCardProps) {
  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-dark via-primary-800 to-secondary shadow-elevated">
      <CardContent className="p-6 pt-6 text-primary-foreground">
        <p className="text-sm font-medium text-slate-300">Total Savings</p>
        <div className="mt-2">
          <MoneyDisplay amount={balance} size="xl" className="text-white" />
        </div>
        {todayChange !== undefined && todayChange > 0 ? (
          <p className="mt-2 flex items-center gap-1 text-sm text-emerald-300">
            <TrendingUp className="h-4 w-4" />
            +{todayChange.toFixed(2)} GHS today
          </p>
        ) : null}
        <Link href={depositHref} className="mt-6 block">
          <Button variant="secondary" className="w-full font-semibold">
            Make a Deposit
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
