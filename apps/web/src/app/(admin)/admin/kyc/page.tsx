"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi, kycApi, KycDocument } from "@/lib/api";
import { getInitials, cn, formatDate } from "@/lib/utils";
import { IdentityReviewDialog } from "@/components/kyc/identity-review-dialog";
import {
  ShieldCheck,
  Eye,
  FileText,
  Search,
  RefreshCw,
  LayoutGrid,
  ListFilter,
  FileCheck2,
  Building2,
} from "@/components/icons/phosphor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faLink } from "@fortawesome/free-solid-svg-icons";

export interface GroupedCustomerKyc {
  customerId: string;
  customerName: string;
  customerEmail: string;
  cardId: string;
  tenantName: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  documents: KycDocument[];
  rejectionReason?: string;
  customerObj?: any;
}

export default function AdminKycPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Inspection Modal State
  const [inspectSubmission, setInspectSubmission] =
    useState<GroupedCustomerKyc | null>(null);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);

  // Mandatory Verification Checklist State
  const [checks, setChecks] = useState({
    idNumberMatches: false,
    nameMatches: false,
    selfieMatches: false,
    documentLegible: false,
  });

  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);

  // Fetch global KYC documents for Super Admin
  const {
    data: kycData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-global-kyc", selectedStatus],
    queryFn: () => adminApi.getKycQueue(),
  });

  const rawDocuments = kycData?.items ?? [];

  // Group raw KycDocument entries BY CUSTOMER so 1 customer = 1 bundle card/row
  const groupedSubmissions = useMemo(() => {
    if (!rawDocuments) return [];

    const map = new Map<string, GroupedCustomerKyc>();

    for (const doc of rawDocuments) {
      const customerId = doc.customer?.id || doc.customerId || doc.id;
      const customerName = doc.customer?.user
        ? `${doc.customer.user.firstName} ${doc.customer.user.lastName}`
        : "Unknown Customer";
      const customerEmail = doc.customer?.user?.email || "N/A";
      const tenantName =
        (doc.customer as any)?.tenant?.name || "Global / Unassigned";
      const cardId =
        doc.customer?.ghanaCardNumber || doc.customer?.customerNumber || "N/A";

      if (!map.has(customerId)) {
        map.set(customerId, {
          customerId,
          customerName,
          customerEmail,
          tenantName,
          cardId,
          status: doc.status as any,
          submittedAt: doc.createdAt,
          documents: [doc],
          rejectionReason: doc.rejectionReason,
          customerObj: doc.customer,
        });
      } else {
        const existing = map.get(customerId)!;
        existing.documents.push(doc);
        if (doc.status === "pending") {
          existing.status = "pending";
        }
        if (doc.rejectionReason && !existing.rejectionReason) {
          existing.rejectionReason = doc.rejectionReason;
        }
      }
    }

    return Array.from(map.values());
  }, [rawDocuments]);

  // Filter grouped submissions by selected status tab and search query
  const filteredSubmissions = useMemo(() => {
    return groupedSubmissions.filter((sub) => {
      if (selectedStatus && sub.status !== selectedStatus) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        sub.customerName.toLowerCase().includes(q) ||
        sub.customerEmail.toLowerCase().includes(q) ||
        sub.cardId.toLowerCase().includes(q) ||
        sub.tenantName.toLowerCase().includes(q)
      );
    });
  }, [groupedSubmissions, selectedStatus, searchQuery]);

  // Review mutation (Super Admin Override / Validation Power)
  const reviewMutation = useMutation({
    mutationFn: ({
      customerId,
      status,
      reason,
    }: {
      customerId: string;
      status: "approved" | "rejected";
      reason?: string;
    }) => kycApi.reviewBundle(customerId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-global-kyc"] });
      queryClient.invalidateQueries({ queryKey: ["kyc-documents"] });
    },
    onError: (err) => {
      alert(
        err instanceof Error
          ? err.message
          : "Super Admin KYC verification failed",
      );
    },
  });

  const resetChecks = () => {
    setChecks({
      idNumberMatches: false,
      nameMatches: false,
      selfieMatches: false,
      documentLegible: false,
    });
  };

  const openInspector = (submission: GroupedCustomerKyc) => {
    setInspectSubmission(submission);
    setSelectedDocIndex(0);
    setRejectionReason(submission.rejectionReason || "");
    resetChecks();
  };

  const handleApproveBundle = async (submission: GroupedCustomerKyc) => {
    setActiveReviewId(submission.customerId);
    try {
      await reviewMutation.mutateAsync({
        customerId: submission.customerId,
        status: "approved",
      });
      setInspectSubmission(null);
      setActiveReviewId(null);
      resetChecks();
    } catch {
      setActiveReviewId(null);
    }
  };

  const handleRejectBundle = async (submission: GroupedCustomerKyc) => {
    if (!rejectionReason || !rejectionReason.trim()) {
      alert(
        "Please select or specify a rejection reason for compliance audit records.",
      );
      return;
    }
    setActiveReviewId(submission.customerId);
    try {
      await reviewMutation.mutateAsync({
        customerId: submission.customerId,
        status: "rejected",
        reason: rejectionReason,
      });
      setInspectSubmission(null);
      setActiveReviewId(null);
      setRejectionReason("");
      resetChecks();
    } catch {
      setActiveReviewId(null);
    }
  };

  // Summary Metrics
  const pendingCount = groupedSubmissions.filter(
    (d) => d.status === "pending",
  ).length;
  const approvedCount = groupedSubmissions.filter(
    (d) => d.status === "approved",
  ).length;
  const rejectedCount = groupedSubmissions.filter(
    (d) => d.status === "rejected",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="dashboard-title">Identity Queue & Compliance</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Super Admin global verification authority and source of truth across
            all Susu companies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs font-semibold"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh Global Queue
          </Button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Pending Global Verification
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground">
            {pendingCount}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Needs audit validation
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Approved Customers
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-foreground text-emerald-600 dark:text-emerald-400">
            {approvedCount}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Verified identity records
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Rejected Submissions
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tabular-nums tracking-tight text-red-600 dark:text-red-400">
            {rejectedCount}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Declined compliance files
          </p>
        </Card>

        <Card className="rounded-none border border-border/60 bg-card p-4 shadow-sm flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Compliance Standard
          </p>
          <p className="mt-1 text-sm sm:text-base font-semibold tracking-tight text-foreground">
            Act 843 Ready
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Data protection & anti-fraud
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="company-filter-tabs overflow-x-auto w-full sm:w-auto">
          {[
            { label: "Pending Audit", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "All Records", value: "" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={cn(
                "company-filter-tab",
                selectedStatus === tab.value && "is-active",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-none">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 text-xs font-semibold transition-colors",
                viewMode === "grid"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground",
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 text-xs font-semibold transition-colors",
                viewMode === "table"
                  ? "bg-card text-foreground"
                  : "text-muted-foreground",
              )}
              title="Table View"
            >
              <ListFilter className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search customer name, email or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-none border border-border/60"
            />
          </div>
        </div>
      </div>

      {/* Main View Container */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse p-4 space-y-3">
              <div className="h-32 bg-muted rounded" />
              <div className="h-4 bg-muted w-2/3 rounded" />
              <div className="h-8 bg-muted rounded" />
            </Card>
          ))}
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="p-8 text-center bg-card/50 border-dashed">
          <p className="text-xs text-muted-foreground font-medium">
            No customer identity submissions matching filter.
          </p>
        </Card>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((sub) => {
            const initials = getInitials(sub.customerName);
            const primaryDoc =
              sub.documents.find((d) => d.documentType !== "selfie") ||
              sub.documents[0];
            const selfieDoc = sub.documents.find(
              (d) => d.documentType === "selfie",
            );

            return (
              <Card
                key={sub.customerId}
                className="overflow-hidden border border-border bg-card flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <CardHeader className="p-4 pb-3 border-b border-border">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate">
                            {sub.customerName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {sub.customerEmail}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={sub.status} />
                    </div>
                  </CardHeader>

                  {/* Multi-Document Attachments Grid */}
                  <div className="p-3 bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-primary" />
                        {sub.tenantName}
                      </span>
                      <span className="text-primary font-bold">
                        {sub.documents.length} File
                        {sub.documents.length > 1 ? "s" : ""} Attached
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Primary ID Document Thumbnail */}
                      <div
                        onClick={() => openInspector(sub)}
                        className="relative aspect-4/3 bg-slate-950 rounded overflow-hidden border border-slate-800 cursor-pointer group flex flex-col items-center justify-center"
                      >
                        {primaryDoc && primaryDoc.fileUrl.endsWith(".pdf") ? (
                          <div className="p-2 text-center text-white text-[10px] font-bold space-y-1">
                            <FileText className="h-5 w-5 text-primary mx-auto" />
                            <span>PDF Copy</span>
                          </div>
                        ) : primaryDoc ? (
                          <img
                            src={primaryDoc.fileUrl}
                            alt="ID Preview"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : null}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-slate-300 font-bold px-1.5 py-0.5 text-center truncate">
                          🇬🇭{" "}
                          {primaryDoc
                            ? primaryDoc.documentType
                                .toUpperCase()
                                .replace("_", " ")
                            : "ID Photo"}
                        </div>
                      </div>

                      {/* Selfie Document Thumbnail */}
                      <div
                        onClick={() => openInspector(sub)}
                        className="relative aspect-4/3 bg-slate-950 rounded overflow-hidden border border-slate-800 cursor-pointer group flex flex-col items-center justify-center"
                      >
                        {selfieDoc ? (
                          <img
                            src={selfieDoc.fileUrl}
                            alt="Selfie Preview"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <div className="text-slate-500 text-[10px] font-semibold text-center">
                            No Selfie
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-[10px] text-slate-300 font-bold px-1.5 py-0.5 text-center truncate">
                          📸 FACIAL SELFIE
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Info Metadata */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        Ghana Card / ID No:
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {sub.cardId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        Submitted Date:
                      </span>
                      <span className="text-muted-foreground font-medium">
                        {formatDate(sub.submittedAt)}
                      </span>
                    </div>

                    {sub.status === "rejected" && sub.rejectionReason && (
                      <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs dark:bg-red-950/30 dark:text-red-300 border border-red-100 dark:border-red-900/30 font-medium">
                        <strong>Rejection Reason:</strong> {sub.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 pt-0">
                  <Button
                    size="sm"
                    onClick={() => openInspector(sub)}
                    className={cn(
                      "w-full text-xs font-semibold gap-1.5",
                      sub.status === "pending"
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground border border-border hover:bg-muted/80",
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {sub.status === "pending"
                      ? "Audit & Verify Identity"
                      : "Review & Override Status"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border uppercase text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Susu Organization</th>
                  <th className="p-3">Card / ID Number</th>
                  <th className="p-3">Submitted Files</th>
                  <th className="p-3">Submission Date</th>
                  <th className="p-3">Audit Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubmissions.map((sub) => {
                  const initials = getInitials(sub.customerName);

                  return (
                    <tr
                      key={sub.customerId}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {sub.customerName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {sub.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-medium text-foreground">
                        <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {sub.tenantName}
                        </span>
                      </td>

                      <td className="p-3 font-mono font-semibold text-foreground">
                        {sub.cardId}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded">
                          {sub.documents.length} File
                          {sub.documents.length > 1 ? "s" : ""} (ID + Selfie)
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDate(sub.submittedAt)}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInspector(sub)}
                          className="text-xs font-semibold h-8 gap-1.5"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {sub.status === "pending"
                            ? "Audit & Verify"
                            : "Review Record"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {inspectSubmission && (
        <IdentityReviewDialog
          subject={{
            ...inspectSubmission,
            organization: inspectSubmission.tenantName,
          }}
          selectedDocIndex={selectedDocIndex}
          onSelectDoc={setSelectedDocIndex}
          checks={checks}
          onChecksChange={setChecks}
          rejectionReason={rejectionReason}
          onRejectionReasonChange={setRejectionReason}
          onClose={() => setInspectSubmission(null)}
          onApprove={() => handleApproveBundle(inspectSubmission)}
          onReject={() => handleRejectBundle(inspectSubmission)}
          isPending={activeReviewId === inspectSubmission.customerId}
          alwaysEditable
        />
      )}
    </div>
  );
}
