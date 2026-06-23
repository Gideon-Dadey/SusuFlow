'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { kycApi } from '@/lib/api';

export default function KycReviewPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['kyc-documents', selectedStatus],
    queryFn: () => kycApi.list(selectedStatus || undefined),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: 'approved' | 'rejected';
      reason?: string;
    }) => kycApi.review(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-documents'] });
      setActiveReviewId(null);
    },
    onError: (err) => {
      alert(err instanceof Error ? err.message : 'KYC action failed');
    },
  });

  const handleApprove = async (id: string) => {
    setActiveReviewId(id);
    await reviewMutation.mutateAsync({ id, status: 'approved' });
  };

  const handleReject = async (id: string) => {
    const reason = rejectionReasons[id];
    if (!reason || !reason.trim()) {
      alert('Please specify a rejection reason');
      return;
    }
    setActiveReviewId(id);
    await reviewMutation.mutateAsync({ id, status: 'rejected', reason });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="dashboard-title">KYC Document Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verify customer identity documents to upgrade account limits
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['pending', 'approved', 'rejected', ''].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={selectedStatus === status ? 'primary' : 'outline'}
              onClick={() => setSelectedStatus(status)}
              className="text-xs font-semibold px-3 min-h-[36px]"
            >
              {status === '' ? 'All' : status.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted w-1/3 rounded" />
                <div className="h-6 bg-muted w-2/3 rounded" />
                <div className="h-8 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !documents || documents.length === 0 ? (
        <Card className="p-8 text-center bg-card/50 backdrop-blur-sm border-dashed">
          <p className="text-muted-foreground text-sm">No KYC documents found matching filter</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const customerName = doc.customer?.user
              ? `${doc.customer.user.firstName} ${doc.customer.user.lastName}`
              : 'Unknown Customer';
            const customerEmail = doc.customer?.user?.email || 'N/A';

            return (
              <Card key={doc.id} className="overflow-hidden bg-card/60 backdrop-blur-md border border-border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full bg-muted flex items-center justify-center border-b border-border">
                    {doc.fileUrl.endsWith('.pdf') ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline text-sm font-semibold flex flex-col items-center gap-2"
                      >
                        📄 Open PDF Document
                      </a>
                    ) : (
                      <img
                        src={doc.fileUrl}
                        alt="KYC Document Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                      <StatusBadge status={doc.status} />
                    </div>
                    <CardTitle className="text-base font-bold mt-2 text-foreground">
                      {customerName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{customerEmail}</p>
                    <p className="text-xs font-mono text-muted-foreground/80 mt-1">
                      No: {doc.customer?.customerNumber}
                    </p>
                  </CardHeader>
                </div>

                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="text-xs text-muted-foreground border-t border-border pt-3">
                    Submitted: {new Date(doc.createdAt).toLocaleString()}
                  </div>

                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs dark:bg-red-950/30 dark:text-red-300 border border-red-100 dark:border-red-900/30">
                      <strong>Rejection Reason:</strong> {doc.rejectionReason}
                    </div>
                  )}

                  {doc.status === 'pending' && (
                    <div className="space-y-3 pt-2">
                      <Input
                        placeholder="Rejection reason..."
                        value={rejectionReasons[doc.id] || ''}
                        onChange={(e) =>
                          setRejectionReasons((prev) => ({ ...prev, [doc.id]: e.target.value }))
                        }
                        className="text-xs min-h-[36px]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          loading={activeReviewId === doc.id && reviewMutation.isPending}
                          onClick={() => handleReject(doc.id)}
                          className="text-xs font-semibold w-full"
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={activeReviewId === doc.id && reviewMutation.isPending}
                          onClick={() => handleApprove(doc.id)}
                          className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white w-full border-none"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
