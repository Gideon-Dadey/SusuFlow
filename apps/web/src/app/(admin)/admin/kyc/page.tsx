"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi, kycApi, KycDocument } from "@/lib/api";
import { getInitials, cn, formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Search,
  CheckSquare,
  ExternalLink,
  RefreshCw,
  X,
  LayoutGrid,
  ListFilter,
  IdCard,
  Camera,
  FileCheck2,
  Building2,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faLink } from "@fortawesome/free-solid-svg-icons";

const COMMON_REJECTION_REASONS = [
  "Ghana Card photo is blurry or unreadable",
  "Selfie photo does not match Ghana Card face",
  "Ghana Card number format is invalid",
  "Back photo of Ghana Card is missing",
  "Expired ID document submitted",
  "Document name does not match customer profile",
];

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

  const allChecksPassed =
    checks.idNumberMatches &&
    checks.nameMatches &&
    checks.selfieMatches &&
    checks.documentLegible;

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
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground">
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
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-foreground text-emerald-600 dark:text-emerald-400">
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
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tabular-nums tracking-tight text-red-600 dark:text-red-400">
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
          <p className="mt-1 text-sm sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground">
            Act 843 Ready
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Data protection & anti-fraud
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
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
                "px-3 py-1.5 text-xs font-semibold transition-colors border-b-2",
                selectedStatus === tab.value
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
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

      {/* FULL-SCREEN SUPER ADMIN AUDIT & VERIFICATION INSPECTION MODAL */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-card border border-border rounded-lg overflow-hidden flex flex-col my-auto max-h-[90vh] shadow-xl">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded bg-primary/20 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Super Admin Identity Verification Portal</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {inspectSubmission.documents.length} ATTACHMENT
                      {inspectSubmission.documents.length > 1 ? "S" : ""}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Customer: {inspectSubmission.customerName} (
                    {inspectSubmission.customerEmail}) • Org:{" "}
                    {inspectSubmission.tenantName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="size-8 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Main Body */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: High-Res Document Viewer with Switcher Tabs */}
              <div className="lg:col-span-7 space-y-3">
                {/* Document Switcher Tabs */}
                <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
                  {inspectSubmission.documents.map((doc, idx) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocIndex(idx)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1.5",
                        selectedDocIndex === idx
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {doc.documentType === "selfie" ? (
                        <>
                          <Camera className="h-3.5 w-3.5" />
                          <span>Facial Selfie</span>
                        </>
                      ) : (
                        <>
                          <IdCard className="h-3.5 w-3.5" />
                          <span>
                            {doc.documentType.toUpperCase().replace("_", " ")}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>
                    Viewing File {selectedDocIndex + 1} of{" "}
                    {inspectSubmission.documents.length}:{" "}
                    <strong className="text-foreground">
                      {inspectSubmission.documents[
                        selectedDocIndex
                      ]?.documentType
                        .toUpperCase()
                        .replace("_", " ")}
                    </strong>
                  </span>
                  {inspectSubmission.documents[selectedDocIndex]?.fileUrl && (
                    <a
                      href={
                        inspectSubmission.documents[selectedDocIndex].fileUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-xs font-medium"
                    >
                      <span>Full Screen Original</span>{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* High-Res Contained Image Preview */}
                <div className="relative aspect-4/3 w-full bg-slate-950 rounded overflow-hidden border border-slate-800 flex items-center justify-center">
                  {inspectSubmission.documents[
                    selectedDocIndex
                  ]?.fileUrl.endsWith(".pdf") ? (
                    <iframe
                      src={
                        inspectSubmission.documents[selectedDocIndex].fileUrl
                      }
                      className="w-full h-full"
                      title="KYC PDF Viewer"
                    />
                  ) : inspectSubmission.documents[selectedDocIndex]?.fileUrl ? (
                    <img
                      src={
                        inspectSubmission.documents[selectedDocIndex].fileUrl
                      }
                      alt="Full Inspection Copy"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : null}
                </div>

                {/* Customer Details metadata */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-muted/40 border border-border">
                    <span className="text-muted-foreground block font-medium">
                      Ghana Card / ID No:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {inspectSubmission.cardId}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-muted/40 border border-border">
                    <span className="text-muted-foreground block font-medium">
                      Submitted Timestamp:
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDate(inspectSubmission.submittedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Verification Checklist & Super Admin Audit Action */}
              <div className="lg:col-span-5 space-y-4 border-t lg:border-t-0 lg:border-l lg:pl-5 border-border">
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>Super Admin Auditor Checklist *</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Verify compliance criteria to approve or override identity
                    status:
                  </p>

                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 p-2 rounded border border-border hover:bg-muted/30 cursor-pointer text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={checks.idNumberMatches}
                        onChange={(e) =>
                          setChecks((prev) => ({
                            ...prev,
                            idNumberMatches: e.target.checked,
                          }))
                        }
                        className="mt-0.5 size-4 rounded text-primary focus:ring-primary"
                      />
                      <span>1. Ghana Card / ID Number matches registry</span>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 rounded border border-border hover:bg-muted/30 cursor-pointer text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={checks.nameMatches}
                        onChange={(e) =>
                          setChecks((prev) => ({
                            ...prev,
                            nameMatches: e.target.checked,
                          }))
                        }
                        className="mt-0.5 size-4 rounded text-primary focus:ring-primary"
                      />
                      <span>2. Customer name matches ID document</span>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 rounded border border-border hover:bg-muted/30 cursor-pointer text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={checks.selfieMatches}
                        onChange={(e) =>
                          setChecks((prev) => ({
                            ...prev,
                            selfieMatches: e.target.checked,
                          }))
                        }
                        className="mt-0.5 size-4 rounded text-primary focus:ring-primary"
                      />
                      <span>3. Facial selfie matches ID photo</span>
                    </label>

                    <label className="flex items-start gap-2.5 p-2 rounded border border-border hover:bg-muted/30 cursor-pointer text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={checks.documentLegible}
                        onChange={(e) =>
                          setChecks((prev) => ({
                            ...prev,
                            documentLegible: e.target.checked,
                          }))
                        }
                        className="mt-0.5 size-4 rounded text-primary focus:ring-primary"
                      />
                      <span>4. Image photo is crisp and legible</span>
                    </label>
                  </div>
                </div>

                {/* Common Rejection Reasons Selector */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <label className="block text-xs font-semibold text-foreground">
                    Rejection Reason (Required if Declining):
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-border bg-card text-foreground"
                  >
                    <option value="">Select standard reason...</option>
                    {COMMON_REJECTION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="text"
                    placeholder="Or type custom rejection notes..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="text-xs h-8 border border-border mt-1"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 space-y-2 border-t border-border">
                  <Button
                    onClick={() => handleApproveBundle(inspectSubmission)}
                    disabled={
                      !allChecksPassed ||
                      activeReviewId === inspectSubmission.customerId
                    }
                    className="w-full text-xs font-semibold h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {activeReviewId === inspectSubmission.customerId
                      ? "Verifying..."
                      : "Approve & Verify Identity"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleRejectBundle(inspectSubmission)}
                    disabled={
                      !rejectionReason.trim() ||
                      activeReviewId === inspectSubmission.customerId
                    }
                    className="w-full text-xs font-semibold h-10 gap-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    {activeReviewId === inspectSubmission.customerId
                      ? "Processing..."
                      : "Reject Submission"}
                  </Button>

                  {!allChecksPassed && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center">
                      * Check all 4 verification boxes above to enable Approval.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
