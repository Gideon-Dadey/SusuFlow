'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { staffPlanApi } from '@/lib/api';

export default function SavingsGoalsTrackerPage() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['staff-plans-enrollments'],
    queryFn: () => staffPlanApi.listAllEnrollments(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-title">Customer Savings Goals</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="p-4">
                <div className="h-4 bg-muted w-1/3 rounded" />
                <div className="h-6 bg-muted w-2/3 rounded mt-2" />
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="h-2 bg-muted rounded" />
                <div className="h-4 bg-muted w-1/2 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !enrollments || enrollments.length === 0 ? (
        <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-dashed">
          <p className="text-muted-foreground text-sm">No active savings plan enrollments found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const customerName = enrollment.customer?.user
              ? `${enrollment.customer.user.firstName} ${enrollment.customer.user.lastName}`
              : 'Unknown Saver';
            const saved = Number(enrollment.savedAmount || 0);
            const target = Number(enrollment.targetAmount || 0);
            const progress = enrollment.progressPercent || 0;

            return (
              <Card
                key={enrollment.id}
                className="bg-card/65 backdrop-blur-md border border-border shadow-sm flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {enrollment.plan?.frequency} SUSU
                    </span>
                    <StatusBadge status={enrollment.status} />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {enrollment.plan?.name || 'Savings Goal'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Saver: <strong>{customerName}</strong> ({enrollment.customer?.customerNumber})
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Progress ({progress}%)</span>
                      <span className="text-foreground">
                        GHS {saved.toFixed(2)} / GHS {target.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3.5 mt-2 text-muted-foreground">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                        Started At
                      </span>
                      <span className="font-semibold text-foreground">
                        {new Date(enrollment.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {enrollment.endsAt && (
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                          Ends At
                        </span>
                        <span className="font-semibold text-foreground">
                          {new Date(enrollment.endsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
