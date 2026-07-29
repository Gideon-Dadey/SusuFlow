"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kycApi, userApi, KycDocument } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  IdCard,
  UserCheck,
  XCircle,
  Building2,
  Lock,
  ChevronRight,
} from "lucide-react";

type DocType = "ghana_card" | "passport" | "utility_bill" | "selfie";

const DOC_TYPES: { id: DocType; name: string; icon: string; hint: string }[] = [
  {
    id: "ghana_card",
    name: "Ghana Card (National ID)",
    icon: "🇬🇭",
    hint: "e.g. GHA-000000000-0",
  },
  {
    id: "passport",
    name: "National Passport",
    icon: "🛂",
    hint: "Passport Number",
  },
  {
    id: "utility_bill",
    name: "Utility Bill / Proof of Address",
    icon: "📄",
    hint: "Bill Reference Number",
  },
  {
    id: "selfie",
    name: "Selfie with ID Document",
    icon: "📸",
    hint: "Clear photo holding ID",
  },
];

export default function CustomerKycPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [documentType, setDocumentType] = useState<DocType>("ghana_card");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [fileDataUrl, setFileDataUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Query user profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me"],
    queryFn: () => userApi.getMe(),
  });

  // Query KYC status
  const {
    data: kycStatusData,
    isLoading: statusLoading,
    refetch,
  } = useQuery({
    queryKey: ["customer-kyc-status"],
    queryFn: () => kycApi.getMyStatus(),
  });

  useEffect(() => {
    if (kycStatusData?.ghanaCardNumber && !idNumber) {
      setIdNumber(kycStatusData.ghanaCardNumber);
    }
    if (kycStatusData?.address && !address) {
      setAddress(kycStatusData.address);
    }
  }, [kycStatusData, idNumber, address]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be under 5MB.");
      return;
    }

    setFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit KYC Mutation
  const submitMutation = useMutation({
    mutationFn: () =>
      kycApi.submit({
        documentType,
        idNumber,
        dateOfBirth,
        address,
        fileUrl:
          fileDataUrl ||
          `https://assets.susuflow.com/docs/${documentType}_sample.png`,
      }),
    onSuccess: () => {
      setSuccessMsg("KYC verification documents submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["customer-kyc-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile-me"] });
      refetch();
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to submit verification document.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!idNumber.trim()) {
      setErrorMsg("Please enter your Document / Ghana Card number.");
      return;
    }
    if (!fileDataUrl) {
      setErrorMsg(
        "Please select and upload a clear photo or copy of your document.",
      );
      return;
    }

    submitMutation.mutate();
  };

  const hasSubmittedDoc = (kycStatusData?.documents?.length ?? 0) > 0;
  const isVerified =
    kycStatusData?.kycStatus === "verified" ||
    (kycStatusData?.kycStatus as string) === "approved";
  const isPending =
    hasSubmittedDoc &&
    (kycStatusData?.kycStatus === "pending" ||
      kycStatusData?.documents?.some((d) => d.status === "pending"));
  const isRejected = hasSubmittedDoc && kycStatusData?.kycStatus === "rejected";
  const latestDoc = kycStatusData?.documents?.[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors border border-border/60">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="dashboard-title text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Identity Verification (KYC)
            </h1>
            <p className="text-xs text-muted-foreground">
              Bank of Ghana regulatory compliance & anti-fraud security protocol
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
          <Lock className="h-3.5 w-3.5" />
          <span>256-bit Encrypted Security</span>
        </div>
      </div>

      {/* Verification Status Card Banner */}
      <Card className="border-border/60 overflow-hidden relative shadow-sm">
        <div
          className={`h-1.5 w-full ${
            isVerified
              ? "bg-emerald-500"
              : isPending
                ? "bg-amber-500 animate-pulse"
                : isRejected
                  ? "bg-rose-500"
                  : "bg-primary"
          }`}
        />
        <CardContent className="p-6">
          {statusLoading ? (
            <div className="flex items-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-64 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : isVerified ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      Identity Verified (Level 1)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Approved
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Your Ghana Card / ID verification is active. You have full
                    access to deposits and transactions.
                  </p>
                </div>
              </div>
              <Link href="/deposit">
                <Button className="shrink-0 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  Make a Deposit
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : isPending ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <Clock className="h-8 w-8 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      Verification Under Review
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      In Review
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Your submitted ID document is being processed by our
                    compliance team. Verification takes 1–2 hours.
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border/50 shrink-0">
                Submitted:{" "}
                {latestDoc
                  ? new Date(latestDoc.createdAt).toLocaleDateString()
                  : "Just now"}
              </div>
            </div>
          ) : isRejected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                  <XCircle className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      Verification Declined
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      Rejected
                    </span>
                  </div>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-0.5 font-medium">
                    Reason:{" "}
                    {latestDoc?.rejectionReason ||
                      "Image blurry or document details unreadable. Please re-upload."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <IdCard className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Complete Identity Verification
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Upload your valid Ghana Card or Passport to unlock deposits
                    and automated savings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Verification Form (Only if not verified / re-submitting) */}
      {!isVerified && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                1. Select Identification Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOC_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setDocumentType(type.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                      documentType === type.id
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border/60 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{type.icon}</span>
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {type.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {type.hint}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* ID Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Document / Ghana Card Number *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. GHA-723491028-1"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="h-11 font-mono"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground">
                    Date of Birth (Optional)
                  </label>
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">
                  Residential Address (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. House No 42, Spintex Road, Accra"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upload Document Section */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-primary" />
                2. Upload Clear Photo or Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 text-center transition-colors bg-muted/20">
                {fileDataUrl ? (
                  <div className="space-y-3">
                    <img
                      src={fileDataUrl}
                      alt="Document Preview"
                      className="max-h-48 mx-auto rounded-lg border border-border shadow-sm object-cover"
                    />
                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {fileName} Attached
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFileDataUrl("");
                        setFileName("");
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-3 block">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Click to upload or drag photo here
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, or PDF up to 5MB (Make sure ID details and
                        photo are clearly legible)
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Error and Success Banners */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold"
                disabled={submitMutation.isPending || isPending}
              >
                {submitMutation.isPending
                  ? "Submitting Verification..."
                  : "Submit Document for Verification"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}

      {/* Regulatory Trust Footer */}
      <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
        <Building2 className="h-5 w-5 text-primary shrink-0" />
        <div>
          <span className="font-semibold text-foreground">
            Data Privacy Guarantee:
          </span>{" "}
          All identity documents are encrypted using AES-256 and stored in
          compliance with the Data Protection Act 2012 (Act 843) of Ghana.
        </div>
      </div>
    </div>
  );
}
