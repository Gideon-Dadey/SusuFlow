import type {
  KycDocument,
  KycDocumentType,
  KycStatusResponse,
} from "@/lib/api";
import { isValidGhanaCard, formatGhanaCard } from "@susuflow/shared/client";

export type CustomerIdType = Exclude<
  KycDocumentType,
  "selfie" | "utility_bill"
>;

export const CUSTOMER_ID_OPTIONS: {
  type: CustomerIdType;
  label: string;
  hint: string;
  needsBack: boolean;
}[] = [
  {
    type: "ghana_card",
    label: "Ghana Card",
    hint: "National ID (GHA-XXXXXXXXX-X)",
    needsBack: true,
  },
  {
    type: "voter_id",
    label: "Voter ID",
    hint: "Electoral Commission card",
    needsBack: true,
  },
  {
    type: "nhis",
    label: "NHIS Card",
    hint: "National Health Insurance",
    needsBack: true,
  },
  {
    type: "passport",
    label: "Passport",
    hint: "Bio-data page photo",
    needsBack: false,
  },
];

export function isKycVerified(status?: KycStatusResponse | null): boolean {
  if (!status) return false;
  return status.kycStatus === "verified" || status.kycLevel >= 2;
}

export function isKycPendingReview(status?: KycStatusResponse | null): boolean {
  if (!status || isKycVerified(status)) return false;
  if (status.kycStatus === "rejected") return false;
  return status.documents.some((d) => d.status === "pending");
}

export function latestRejectionReason(
  documents: KycDocument[] | undefined,
): string | null {
  if (!documents?.length) return null;
  const rejected = documents.find((d) => d.status === "rejected");
  return rejected?.rejectionReason?.trim() || null;
}

export function normalizeIdNumber(
  documentType: CustomerIdType,
  value: string,
): string {
  const trimmed = value.trim();
  if (documentType === "ghana_card") {
    return formatGhanaCard(trimmed);
  }
  return trimmed;
}

export function validateIdNumber(
  documentType: CustomerIdType,
  value: string,
): string | null {
  const normalized = normalizeIdNumber(documentType, value);
  if (!normalized) return "Enter your ID number.";
  if (documentType === "ghana_card" && !isValidGhanaCard(normalized)) {
    return "Use Ghana Card format GHA-XXXXXXXXX-X.";
  }
  if (normalized.length < 5) return "ID number looks too short.";
  return null;
}

export function idTypeLabel(type: string): string {
  return (
    CUSTOMER_ID_OPTIONS.find((o) => o.type === type)?.label ||
    type.replace(/_/g, " ")
  );
}
