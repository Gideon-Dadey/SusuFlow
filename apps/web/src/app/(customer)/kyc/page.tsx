"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kycApi, userApi, KycDocument } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  IdCard,
  XCircle,
  Building2,
  Lock,
  ChevronRight,
  Camera,
  RefreshCw,
  Info,
  MapPin,
  User,
  Shield,
  FileCheck2,
  Trash2,
  BadgeCheck,
} from "lucide-react";

type DocType = "ghana_card" | "passport";
type Step = 1 | 2 | 3;

interface DocumentUploadState {
  frontUrl: string;
  frontName: string;
  backUrl: string;
  backName: string;
  selfieUrl: string;
  selfieName: string;
}

export default function CustomerKycPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Step Control
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form State
  const [documentType, setDocumentType] = useState<DocType>("ghana_card");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [digitalAddress, setDigitalAddress] = useState("");

  // Photo Upload States
  const [uploads, setUploads] = useState<DocumentUploadState>({
    frontUrl: "",
    frontName: "",
    backUrl: "",
    backName: "",
    selfieUrl: "",
    selfieName: "",
  });

  // Camera State for Selfie
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Messages
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Query User Profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-me"],
    queryFn: () => userApi.getMe(),
  });

  // Query KYC Status
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

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure stream is attached whenever camera becomes active
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Camera Control Functions
  const startCamera = async () => {
    try {
      setErrorMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 50);
    } catch (err) {
      setErrorMsg(
        "Camera access denied or unequipped. Please upload a selfie photo manually.",
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setUploads((prev) => ({
        ...prev,
        selfieUrl: dataUrl,
        selfieName: `Live_Selfie_${Date.now()}.jpg`,
      }));
      stopCamera();
    }
  };

  // Helper file uploader reader
  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    field: "front" | "back" | "selfie",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("File size must be under 8MB.");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (field === "front") {
        setUploads((prev) => ({
          ...prev,
          frontUrl: dataUrl,
          frontName: file.name,
        }));
      } else if (field === "back") {
        setUploads((prev) => ({
          ...prev,
          backUrl: dataUrl,
          backName: file.name,
        }));
      } else if (field === "selfie") {
        setUploads((prev) => ({
          ...prev,
          selfieUrl: dataUrl,
          selfieName: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded file
  const removeFile = (field: "front" | "back" | "selfie") => {
    if (field === "front") {
      setUploads((prev) => ({ ...prev, frontUrl: "", frontName: "" }));
    } else if (field === "back") {
      setUploads((prev) => ({ ...prev, backUrl: "", backName: "" }));
    } else if (field === "selfie") {
      setUploads((prev) => ({ ...prev, selfieUrl: "", selfieName: "" }));
    }
  };

  // Submit KYC Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      // 1. Submit ID Document (Front Photo)
      await kycApi.submit({
        documentType,
        idNumber,
        dateOfBirth,
        address: address
          ? `${address}${digitalAddress ? ` (${digitalAddress})` : ""}`
          : digitalAddress,
        fileUrl:
          uploads.frontUrl ||
          `https://assets.susuflow.com/docs/${documentType}_front.png`,
      });

      // 2. Submit Selfie Document for Facial Biometrics
      if (uploads.selfieUrl) {
        await kycApi.submit({
          documentType: "selfie",
          idNumber,
          fileUrl: uploads.selfieUrl,
        });
      }
    },
    onSuccess: () => {
      setSuccessMsg(
        "Identity documents submitted successfully for Bank Verification!",
      );
      queryClient.invalidateQueries({ queryKey: ["customer-kyc-status"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile-me"] });
      refetch();
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to submit identity verification.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!idNumber.trim()) {
      setErrorMsg("Please enter your official Ghana Card / Passport Number.");
      return;
    }
    if (!uploads.frontUrl) {
      setErrorMsg(
        "Please upload a clear front photo of your Ghana Card / ID document.",
      );
      return;
    }
    if (documentType === "ghana_card" && !uploads.backUrl) {
      setErrorMsg("Please upload a clear back photo of your Ghana Card.");
      return;
    }
    if (!uploads.selfieUrl) {
      setErrorMsg(
        "Please provide a clear selfie photo for facial verification.",
      );
      return;
    }

    submitMutation.mutate();
  };

  // Status checks
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

  // Ghana Card validation helper
  const isGhanaCardFormatValid =
    documentType !== "ghana_card" ||
    /^GHA-\d{9}-\d$/i.test(idNumber.trim()) ||
    idNumber.trim().length >= 10;

  return (
    <div className="space-y-6">
      {/* Header Bar matching SusuFlow standard */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="dashboard-title">Identity Verification (KYC)</h1>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold shrink-0">
          <Lock className="h-3.5 w-3.5" />
          <span>256-bit Encrypted Security</span>
        </div>
      </div>

      {/* Verification Status Card */}
      <Card className="border border-border overflow-hidden relative">
        <div
          className={cn(
            "h-1.5 w-full",
            isVerified
              ? "bg-emerald-500"
              : isPending
                ? "bg-amber-500 animate-pulse"
                : isRejected
                  ? "bg-rose-500"
                  : "bg-primary",
          )}
        />
        <CardContent className="p-5">
          {statusLoading ? (
            <div className="flex items-center gap-4 py-3">
              <div className="size-10 rounded bg-muted animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-64 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ) : isVerified ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="size-11 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      Identity Verified (Level 1 Status)
                    </h2>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Ghana Card & Facial Biometrics have been authenticated.
                    You have full access to deposits, withdrawals, and Susu
                    savings plans.
                  </p>
                  {kycStatusData?.ghanaCardNumber && (
                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 rounded bg-muted text-xs font-mono text-foreground font-semibold border border-border/50">
                      <span>Card ID:</span>
                      <span className="font-bold text-primary">
                        {kycStatusData.ghanaCardNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Link href="/deposit">
                <Button
                  size="sm"
                  className="shrink-0 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <span>Make a Deposit</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : isPending ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="size-11 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Clock className="h-6 w-6 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      Verification Documents Under Review
                    </h2>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      In Audit
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your submitted Ghana Card photos and selfie are being
                    verified by our compliance team. Verification takes 1–2
                    hours.
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded border border-border/50 shrink-0 font-medium">
                Submitted:{" "}
                {latestDoc
                  ? new Date(latestDoc.createdAt).toLocaleString()
                  : "Just now"}
              </div>
            </div>
          ) : isRejected ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="size-11 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      Identity Verification Declined
                    </h2>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      Resubmission Required
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                    Rejection Reason:{" "}
                    {latestDoc?.rejectionReason ||
                      "Ghana Card photo was blurry or selfie did not match. Please upload high resolution photos."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              <div className="size-11 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <IdCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Complete Bank Identity Verification
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  To safeguard your financial assets and meet Bank of Ghana
                  regulations, upload clear photos of your{" "}
                  <strong>Ghana Card (Front & Back)</strong> and a{" "}
                  <strong>Live Selfie</strong>.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Verification Form */}
      {!isVerified && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Multi-step Stepper */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded border border-border">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-semibold transition-all",
                currentStep === 1
                  ? "bg-card text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">
                1
              </span>
              <span className="truncate">Ghana Card Photos</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-semibold transition-all",
                currentStep === 2
                  ? "bg-card text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">
                2
              </span>
              <span className="truncate">Selfie Check</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded text-xs font-semibold transition-all",
                currentStep === 3
                  ? "bg-card text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px]">
                3
              </span>
              <span className="truncate">Review & Submit</span>
            </button>
          </div>

          {/* STEP 1: GHANA CARD / PASSPORT DETAILS & PHOTOS */}
          {currentStep === 1 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-primary" />
                    <span>Step 1: ID Document & Photos</span>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    National ID Standard
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Document Type Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Select Document Type *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDocumentType("ghana_card")}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded border text-left transition-all",
                        documentType === "ghana_card"
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border hover:bg-muted/30",
                      )}
                    >
                      <span className="text-2xl shrink-0">🇬🇭</span>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Ghana Card (National ID)
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Format: GHA-000000000-0
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDocumentType("passport")}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded border text-left transition-all",
                        documentType === "passport"
                          ? "border-primary bg-primary/10 ring-1 ring-primary"
                          : "border-border hover:bg-muted/30",
                      )}
                    >
                      <span className="text-2xl shrink-0">🛂</span>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Republic of Ghana Passport
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Official Travel Document
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* ID Number & Birth Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>
                        {documentType === "ghana_card"
                          ? "Ghana Card Number (GHA-XXXXXXXXX-X)"
                          : "Passport Number"}{" "}
                        *
                      </span>
                      {!isGhanaCardFormatValid && (
                        <span className="text-rose-500 text-[11px] font-medium">
                          Invalid Format
                        </span>
                      )}
                    </label>
                    <Input
                      type="text"
                      placeholder={
                        documentType === "ghana_card"
                          ? "GHA-723491028-1"
                          : "G0000000"
                      }
                      value={idNumber}
                      onChange={(e) =>
                        setIdNumber(e.target.value.toUpperCase())
                      }
                      className="h-9 font-mono text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Date of Birth (As on Document)
                    </label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Document Photo Uploads */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Document Photos Upload *
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Clear high resolution photo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Front Photo Box */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                        <span>
                          1.{" "}
                          {documentType === "ghana_card"
                            ? "Ghana Card - Front Photo"
                            : "Passport Bio Page"}{" "}
                          *
                        </span>
                      </div>

                      <div className="border-2 border-dashed border-border hover:border-primary rounded p-4 text-center transition-colors bg-muted/20 min-h-[140px] flex items-center justify-center">
                        {uploads.frontUrl ? (
                          <div className="space-y-2 w-full">
                            <img
                              src={uploads.frontUrl}
                              alt="ID Front Preview"
                              className="max-h-28 mx-auto rounded border border-border object-cover"
                            />
                            <div className="flex items-center justify-between gap-2 px-1 text-xs">
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-[130px] font-semibold">
                                ✓ {uploads.frontName || "Front_ID.png"}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFile("front")}
                                className="text-rose-500 hover:text-rose-700 p-1 font-semibold flex items-center gap-1 text-[11px]"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer space-y-1.5 block py-2 w-full">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                              <UploadCloud className="h-4 w-4" />
                            </div>
                            <div className="text-xs font-semibold text-foreground">
                              Upload FRONT Photo
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              JPEG or PNG up to 8MB
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "front")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Back Photo Box (Ghana Card) */}
                    {documentType === "ghana_card" && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                          <span>2. Ghana Card - Back Photo *</span>
                        </div>

                        <div className="border-2 border-dashed border-border hover:border-primary rounded p-4 text-center transition-colors bg-muted/20 min-h-[140px] flex items-center justify-center">
                          {uploads.backUrl ? (
                            <div className="space-y-2 w-full">
                              <img
                                src={uploads.backUrl}
                                alt="ID Back Preview"
                                className="max-h-28 mx-auto rounded border border-border object-cover"
                              />
                              <div className="flex items-center justify-between gap-2 px-1 text-xs">
                                <span className="font-mono text-emerald-600 dark:text-emerald-400 truncate max-w-[130px] font-semibold">
                                  ✓ {uploads.backName || "Back_ID.png"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile("back")}
                                  className="text-rose-500 hover:text-rose-700 p-1 font-semibold flex items-center gap-1 text-[11px]"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer space-y-1.5 block py-2 w-full">
                              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                <UploadCloud className="h-4 w-4" />
                              </div>
                              <div className="text-xs font-semibold text-foreground">
                                Upload BACK Photo
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                Show barcode and signature
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, "back")}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!idNumber.trim()) {
                        setErrorMsg(
                          "Please enter your Ghana Card or Passport number.",
                        );
                        return;
                      }
                      if (!uploads.frontUrl) {
                        setErrorMsg(
                          "Please upload the front photo of your ID document.",
                        );
                        return;
                      }
                      setErrorMsg("");
                      setCurrentStep(2);
                    }}
                    className="gap-1.5 font-semibold text-xs h-9 px-4 bg-primary text-white"
                  >
                    <span>Continue to Selfie Check</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: SELFIE / FACIAL BIOMETRICS */}
          {currentStep === 2 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span>Step 2: Facial Biometric Verification (Selfie)</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Facial Recognition
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                <div className="bg-muted/40 p-3 rounded border border-border flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold text-foreground">
                      Selfie Photo Requirements:
                    </p>
                    <p className="text-muted-foreground">
                      • Look straight into the camera in a well-lit room.
                    </p>
                    <p className="text-muted-foreground">
                      • Remove hats or sunglasses. Face must match your ID
                      photo.
                    </p>
                  </div>
                </div>

                {/* Webcam or File Upload Switcher */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2.5 text-center">
                    <div className="relative aspect-4/3 rounded overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                      {isCameraActive ? (
                        <video
                          ref={(node) => {
                            videoRef.current = node;
                            if (node && streamRef.current) {
                              node.srcObject = streamRef.current;
                              node.play().catch(() => {});
                            }
                          }}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      ) : uploads.selfieUrl ? (
                        <img
                          src={uploads.selfieUrl}
                          alt="Selfie Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="space-y-1.5 p-4 text-center text-slate-400">
                          <User className="h-10 w-10 mx-auto text-slate-500" />
                          <p className="text-xs font-medium">
                            No Selfie Captured Yet
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      {isCameraActive ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={capturePhoto}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 h-8"
                          >
                            <Camera className="h-3.5 w-3.5" /> Snap Photo
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={stopCamera}
                            className="h-8 text-xs font-semibold"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={startCamera}
                          variant="outline"
                          className="gap-1.5 font-semibold text-xs h-8 text-primary border-primary/40 hover:bg-primary/10"
                        >
                          <Camera className="h-3.5 w-3.5" /> Open Camera Selfie
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 border-t md:border-t-0 md:border-l md:pl-5 border-border pt-4 md:pt-0">
                    <div className="text-xs font-semibold text-foreground">
                      Or Upload Selfie File from Device:
                    </div>

                    <div className="border-2 border-dashed border-border hover:border-primary rounded p-4 text-center transition-colors bg-muted/20">
                      {uploads.selfieUrl ? (
                        <div className="space-y-2">
                          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ {uploads.selfieName || "Selfie_Photo.jpg"}{" "}
                            Attached
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile("selfie")}
                            className="text-xs h-7 text-rose-500 font-semibold"
                          >
                            Remove / Change Photo
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer space-y-1.5 block py-2">
                          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                            <UploadCloud className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-semibold text-foreground">
                            Upload Selfie Image
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            JPEG or PNG up to 8MB
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "selfie")}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="font-semibold text-xs h-9 px-4"
                  >
                    Back to Step 1
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!uploads.selfieUrl) {
                        setErrorMsg(
                          "Please capture or upload a selfie photo for facial verification.",
                        );
                        return;
                      }
                      setErrorMsg("");
                      setCurrentStep(3);
                    }}
                    className="gap-1.5 font-semibold text-xs h-9 px-4 bg-primary text-white"
                  >
                    <span>Proceed to Review</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: ADDRESS & FINAL REVIEW SUBMIT */}
          {currentStep === 3 && (
            <Card className="border border-border">
              <CardHeader className="p-4 pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Step 3: Residential Address & Submission Review</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 space-y-5">
                {/* Address Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Residential Street Address
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. House No 14, Spintex Road, East Legon, Accra"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      GhanaPost Digital Address (GPS Code)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. GA-183-9021"
                      value={digitalAddress}
                      onChange={(e) =>
                        setDigitalAddress(e.target.value.toUpperCase())
                      }
                      className="h-9 text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Summary Verification Card */}
                <div className="p-4 rounded bg-muted/40 border border-border space-y-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between border-b border-border pb-1.5">
                    <span>Attached Document Summary</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ 3 Documents Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-2.5 rounded bg-card border border-border/60 text-xs space-y-1">
                      <div className="text-muted-foreground font-medium">
                        Document Type:
                      </div>
                      <div className="font-bold text-foreground uppercase text-xs">
                        {documentType.replace("_", " ")}
                      </div>
                      <div className="font-mono text-primary truncate font-bold text-xs">
                        {idNumber || "Not Provided"}
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-card border border-border/60 text-xs space-y-1">
                      <div className="text-muted-foreground font-medium">
                        ID Photos:
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        ✓ Front Photo Uploaded
                      </div>
                      {documentType === "ghana_card" && (
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          ✓ Back Photo Uploaded
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 rounded bg-card border border-border/60 text-xs space-y-1">
                      <div className="text-muted-foreground font-medium">
                        Facial Check:
                      </div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        ✓ Selfie Attached
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Ready for biometrics match
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error and Success Banners */}
                {errorMsg && (
                  <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="font-semibold text-xs h-9 px-4"
                  >
                    Back to Step 2
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    className="gap-2 font-semibold px-6 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={submitMutation.isPending || isPending}
                  >
                    {submitMutation.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />{" "}
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" /> Submit Documents for
                        Approval
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      )}

      {/* Regulatory Compliance Footnote */}
      <div className="p-4 rounded bg-card border border-border flex items-center gap-3 text-xs text-muted-foreground">
        <Building2 className="h-5 w-5 text-primary shrink-0" />
        <div>
          <span className="font-semibold text-foreground">
            Bank of Ghana Regulatory Guarantee:
          </span>{" "}
          All submitted Ghana Card images and facial biometrics are stored using
          AES-256 encryption in compliance with the Data Protection Act 2012
          (Act 843) of Ghana.
        </div>
      </div>
    </div>
  );
}
