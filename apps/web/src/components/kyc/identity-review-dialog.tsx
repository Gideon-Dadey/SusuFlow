"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Camera,
  Check,
  ExternalLink,
  IdCard,
  X,
} from "@/components/icons/phosphor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyAvatar } from "@/components/company-admin/company-avatar";
import { cn } from "@/lib/utils";

export type IdentityReviewDocument = {
  id: string;
  documentType: string;
  fileUrl: string;
};

export type IdentityReviewSubject = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  cardId: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  documents: IdentityReviewDocument[];
  rejectionReason?: string;
  organization?: string;
};

export type IdentityReviewChecks = {
  idNumberMatches: boolean;
  nameMatches: boolean;
  selfieMatches: boolean;
  documentLegible: boolean;
};

const REJECTION_REASONS = [
  "Ghana Card photo is blurry or unreadable",
  "Selfie photo does not match Ghana Card face",
  "Ghana Card number format is invalid",
  "Back photo of Ghana Card is missing",
  "Expired ID document submitted",
  "Document name does not match customer profile",
];

function formatDocumentType(type: string) {
  const labels: Record<string, string> = {
    selfie: "Selfie",
    ghana_card: "Ghana Card",
    ghana_card_front: "Ghana Card — front",
    ghana_card_back: "Ghana Card — back",
    national_id: "National ID",
    passport: "Passport",
  };
  return (
    labels[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function splitName(fullName: string) {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

type CheckKey = keyof IdentityReviewChecks;

type IdentityReviewDialogProps = {
  subject: IdentityReviewSubject;
  selectedDocIndex: number;
  onSelectDoc: (index: number) => void;
  checks: IdentityReviewChecks;
  onChecksChange: (next: IdentityReviewChecks) => void;
  rejectionReason: string;
  onRejectionReasonChange: (value: string) => void;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isPending?: boolean;
  alwaysEditable?: boolean;
};

export function IdentityReviewDialog({
  subject,
  selectedDocIndex,
  onSelectDoc,
  checks,
  onChecksChange,
  rejectionReason,
  onRejectionReasonChange,
  onClose,
  onApprove,
  onReject,
  isPending = false,
  alwaysEditable = false,
}: IdentityReviewDialogProps) {
  const [mounted, setMounted] = useState(false);
  const { firstName, lastName } = splitName(subject.customerName);
  const activeDoc = subject.documents[selectedDocIndex];
  const editable = alwaysEditable || subject.status === "pending";
  const allChecksPassed =
    checks.idNumberMatches &&
    checks.nameMatches &&
    checks.selfieMatches &&
    checks.documentLegible;

  useEffect(() => {
    setMounted(true);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const checklist: Array<{
    key: CheckKey;
    label: string;
    hint?: string;
  }> = [
    {
      key: "idNumberMatches",
      label: "ID number matches the submitted Ghana Card",
      hint: subject.cardId,
    },
    {
      key: "nameMatches",
      label: "Legal name matches this customer account",
      hint: subject.customerName,
    },
    {
      key: "selfieMatches",
      label: "Selfie matches the photograph on the ID",
    },
    {
      key: "documentLegible",
      label: "Document is clear, unedited, and still valid",
    },
  ];

  return createPortal(
    <div className="company-audit-overlay" role="presentation">
      <button
        type="button"
        className="company-audit-backdrop"
        aria-label="Close identity review"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-review-title"
        className="company-audit"
      >
        <header className="company-audit-header">
          <CompanyAvatar
            firstName={firstName}
            lastName={lastName}
            seed={subject.customerId}
            className="size-10 shrink-0 text-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="identity-review-title" className="company-audit-title">
                Identity review
              </h2>
              <span
                className={cn("company-audit-status", `is-${subject.status}`)}
              >
                {subject.status === "pending"
                  ? "Needs review"
                  : subject.status === "approved"
                    ? "Approved"
                    : "Rejected"}
              </span>
            </div>
            <p className="company-audit-sub">
              {subject.customerName}
              <span className="company-audit-dot" />
              {subject.customerEmail}
              {subject.organization ? (
                <>
                  <span className="company-audit-dot" />
                  {subject.organization}
                </>
              ) : null}
            </p>
          </div>
          <span className="company-audit-files">
            {subject.documents.length}{" "}
            {subject.documents.length === 1 ? "file" : "files"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="company-audit-close"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="company-audit-body">
          <section className="company-audit-viewer">
            <div className="company-audit-tabs" role="tablist">
              {subject.documents.map((doc, index) => {
                const isSelfie = doc.documentType === "selfie";
                return (
                  <button
                    key={doc.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedDocIndex === index}
                    onClick={() => onSelectDoc(index)}
                    className={cn(
                      "company-audit-tab",
                      selectedDocIndex === index && "is-active",
                    )}
                  >
                    {isSelfie ? (
                      <Camera className="h-3.5 w-3.5" />
                    ) : (
                      <IdCard className="h-3.5 w-3.5" />
                    )}
                    {formatDocumentType(doc.documentType)}
                  </button>
                );
              })}
            </div>

            <div className="company-audit-toolbar">
              <p>
                File {selectedDocIndex + 1} of {subject.documents.length}
                {activeDoc ? (
                  <>
                    {" · "}
                    <strong>
                      {formatDocumentType(activeDoc.documentType)}
                    </strong>
                  </>
                ) : null}
              </p>
              {activeDoc?.fileUrl ? (
                <a
                  href={activeDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="company-audit-open"
                >
                  Open original
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </div>

            <div className="company-audit-frame">
              {activeDoc?.fileUrl?.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={activeDoc.fileUrl}
                  className="company-audit-media"
                  title="Identity document"
                />
              ) : activeDoc?.fileUrl ? (
                <img
                  src={activeDoc.fileUrl}
                  alt={formatDocumentType(activeDoc.documentType)}
                  className="company-audit-media"
                />
              ) : (
                <p className="company-audit-empty">No file attached</p>
              )}
            </div>

            <dl className="company-audit-meta">
              <div>
                <dt>Ghana Card</dt>
                <dd>{subject.cardId}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>
                  {new Date(subject.submittedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
            </dl>
          </section>

          <aside className="company-audit-rail">
            {editable ? (
              <>
                <div>
                  <h3 className="company-audit-rail-title">Verification</h3>
                  <p className="company-audit-rail-copy">
                    Confirm each check before you approve this customer.
                  </p>
                </div>

                <div className="company-audit-checks">
                  {checklist.map((item, index) => {
                    const checked = checks[item.key];
                    return (
                      <label
                        key={item.key}
                        className={cn(
                          "company-audit-check",
                          checked && "is-on",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={(event) =>
                            onChecksChange({
                              ...checks,
                              [item.key]: event.target.checked,
                            })
                          }
                        />
                        <span
                          className={cn(
                            "company-audit-tick",
                            checked && "is-on",
                          )}
                          aria-hidden
                        >
                          {checked ? (
                            <Check className="h-3 w-3" weight="bold" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="company-audit-check-label">
                            {item.label}
                          </span>
                          {item.hint ? (
                            <span className="company-audit-check-hint">
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="company-audit-reason">
                  <label htmlFor="identity-reject-reason">Decline reason</label>
                  <select
                    id="identity-reject-reason"
                    value={
                      REJECTION_REASONS.includes(rejectionReason)
                        ? rejectionReason
                        : ""
                    }
                    onChange={(event) =>
                      onRejectionReasonChange(event.target.value)
                    }
                  >
                    <option value="">Select a standard reason</option>
                    {REJECTION_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Or add a custom note for the audit trail"
                    value={rejectionReason}
                    onChange={(event) =>
                      onRejectionReasonChange(event.target.value)
                    }
                    className="h-8 text-xs"
                  />
                </div>

                <div className="company-audit-actions">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    disabled={isPending}
                    onClick={onReject}
                    className="h-8 text-xs font-semibold"
                  >
                    Decline
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!allChecksPassed || isPending}
                    onClick={onApprove}
                    className="h-8 text-xs font-semibold"
                  >
                    {isPending ? "Saving…" : "Approve"}
                  </Button>
                </div>
                {!allChecksPassed ? (
                  <p className="company-audit-hint">
                    Complete all four checks to enable approval.
                  </p>
                ) : null}
              </>
            ) : (
              <div className="company-audit-decision">
                <p className="company-audit-rail-title">Decision</p>
                <p
                  className={cn(
                    "company-audit-decision-value",
                    `is-${subject.status}`,
                  )}
                >
                  {subject.status === "approved" ? "Approved" : "Rejected"}
                </p>
                <p className="company-audit-rail-copy">
                  {subject.status === "approved"
                    ? "This identity package has been verified. No further action is required."
                    : "This identity package was declined. The customer can resubmit documents."}
                </p>
                {subject.rejectionReason ? (
                  <div className="company-audit-decision-note">
                    <span>Reason</span>
                    <p>{subject.rejectionReason}</p>
                  </div>
                ) : null}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}
