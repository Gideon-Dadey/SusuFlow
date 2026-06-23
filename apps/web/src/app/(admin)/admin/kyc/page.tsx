'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCheck, faFileAlt, faLink } from '@fortawesome/free-solid-svg-icons';

export default function AdminKycPage() {
  const { data: kycData, isLoading } = useQuery({
    queryKey: ['admin-global-kyc'],
    queryFn: () => adminApi.getKycQueue(),
  });

  const items = kycData?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="page-header mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Identity KYC Review Queue</h1>
        <p className="text-sm text-muted-foreground">Monitor Ghana Cards, passport booklets, and identity verification logs across all organizations</p>
      </div>

      <Card className="portal-card border-border/60">
        <CardHeader>
          <CardTitle>Global KYC Document Register ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-muted/65" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faUserCheck} className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No KYC documents registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Date Uploaded</th>
                    <th className="py-3 px-4">Saver</th>
                    <th className="py-3 px-4">Organization</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">File Link</th>
                    <th className="py-3 px-4">Reviewed By</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {items.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {doc.customer?.user ? (
                          <>
                            <span>
                              {doc.customer.user.firstName} {doc.customer.user.lastName}
                            </span>
                            <span className="block text-[10px] text-muted-foreground font-mono">
                              {doc.customer.user.email}
                            </span>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {doc.customer?.tenant?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-foreground whitespace-nowrap uppercase">
                        <FontAwesomeIcon icon={faFileAlt} className="mr-1.5 text-muted-foreground" />
                        {doc.documentType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          <FontAwesomeIcon icon={faLink} className="h-3 w-3" />
                          View Document
                        </a>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {doc.reviewedBy ? (
                          <span>
                            {doc.reviewedBy.firstName} {doc.reviewedBy.lastName}
                            {doc.reviewedAt && (
                              <span className="block text-[9px] text-muted-foreground/60">
                                {formatDate(doc.reviewedAt)}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground/60">Not reviewed</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <StatusBadge status={doc.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
