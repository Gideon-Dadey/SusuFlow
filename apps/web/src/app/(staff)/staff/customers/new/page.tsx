"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyAvatar } from "@/components/company-admin/company-avatar";
import { CompanyPageHeader } from "@/components/company-admin/company-page-header";
import {
  CompanyPanel,
  CompanyPanelHeader,
} from "@/components/company-admin/company-panel";
import {
  AlertCircle,
  Check,
  IdCard,
  UserPlus,
} from "@/components/icons/phosphor";
import { customerApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type FieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "ghanaCardNumber"
  | "dateOfBirth"
  | "address";

type FormState = Record<FieldKey, string>;
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  ghanaCardNumber: "",
  dateOfBirth: "",
  address: "",
};

const GH_MOBILE = /^(20|23|24|25|26|27|28|50|53|54|55|56|57|59)\d{7}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_RE = /^GHA-\d{9}-\d$/;

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeGhPhone(raw: string) {
  const digits = digitsOnly(raw);
  if (digits.startsWith("233") && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+233${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) return `+233${digits}`;
  return raw.trim();
}

function nationalMobile(raw: string) {
  const digits = digitsOnly(normalizeGhPhone(raw));
  return digits.startsWith("233")
    ? digits.slice(3)
    : digits.startsWith("0")
      ? digits.slice(1)
      : digits;
}

function formatGhanaCard(raw: string) {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = upper.startsWith("GHA") ? upper.slice(3) : upper;
  const nums = body.replace(/\D/g, "").slice(0, 10);
  if (!nums) return upper.startsWith("G") ? "GHA-" : raw.trim().toUpperCase();
  if (nums.length <= 9) return `GHA-${nums}`;
  return `GHA-${nums.slice(0, 9)}-${nums.slice(9)}`;
}

function ageFrom(iso: string) {
  const born = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(born.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const month = today.getMonth() - born.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < born.getDate())) age -= 1;
  return age;
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const first = form.firstName.trim();
  const last = form.lastName.trim();

  if (!first) errors.firstName = "Required";
  else if (first.length < 2) errors.firstName = "Use the legal first name";

  if (!last) errors.lastName = "Required";
  else if (last.length < 2) errors.lastName = "Use the legal surname";

  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) {
    errors.email = "Enter a valid email";
  }

  if (form.phone.trim()) {
    const national = nationalMobile(form.phone);
    if (!GH_MOBILE.test(national)) {
      errors.phone = "Use a Ghana mobile number";
    }
  }

  if (
    form.ghanaCardNumber.trim() &&
    !CARD_RE.test(form.ghanaCardNumber.trim())
  ) {
    errors.ghanaCardNumber = "Format GHA-123456789-0";
  }

  if (form.dateOfBirth) {
    const age = ageFrom(form.dateOfBirth);
    if (age == null) errors.dateOfBirth = "Enter a valid date";
    else if (age < 18) errors.dateOfBirth = "Saver must be 18 or older";
    else if (age > 110) errors.dateOfBirth = "Check the date of birth";
  }

  return errors;
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="company-field">
      <label htmlFor={id} className="company-field-label">
        <span>
          {label}
          {required ? <span data-req> *</span> : null}
        </span>
      </label>
      {children}
      {error ? (
        <p className="company-field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="company-field-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export default function OnboardCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);
  const [banner, setBanner] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);

  const errors = useMemo(() => validate(form), [form]);
  const show = (key: FieldKey) =>
    Boolean((submitted || touched[key]) && errors[key]);

  const displayName = [form.firstName, form.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  const checks = [
    {
      id: "name",
      label: "Legal name",
      done: !errors.firstName && !errors.lastName,
    },
    {
      id: "phone",
      label: "Ghana mobile",
      done: Boolean(form.phone.trim()) && !errors.phone,
    },
    {
      id: "email",
      label: "Email on file",
      done: Boolean(form.email.trim()) && !errors.email,
    },
    {
      id: "card",
      label: "Ghana Card",
      done: Boolean(form.ghanaCardNumber.trim()) && !errors.ghanaCardNumber,
    },
    {
      id: "dob",
      label: "Date of birth (18+)",
      done: Boolean(form.dateOfBirth) && !errors.dateOfBirth,
    },
    {
      id: "address",
      label: "Residential address",
      done: form.address.trim().length >= 6,
    },
  ];

  const readyCount = checks.filter((item) => item.done).length;
  const canSubmit =
    !errors.firstName && !errors.lastName && Object.keys(errors).length === 0;

  const setField = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setBanner(null);
  };

  const mutation = useMutation({
    mutationFn: () =>
      customerApi.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() ? normalizeGhPhone(form.phone) : undefined,
        ghanaCardNumber: form.ghanaCardNumber.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address.trim() || undefined,
      }),
    onSuccess: (customer) => {
      setBanner({
        tone: "success",
        text: "Member file opened. Opening the profile…",
      });
      void queryClient.invalidateQueries({ queryKey: ["staff-customers"] });
      void queryClient.invalidateQueries({ queryKey: ["staff-all-customers"] });
      void queryClient.invalidateQueries({
        queryKey: ["staff-active-customers"],
      });
      router.push(`/staff/customers/${customer.id}`);
    },
    onError: (err) => {
      setBanner({
        tone: "error",
        text:
          err instanceof Error
            ? err.message
            : "Could not open this member file.",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      ghanaCardNumber: true,
      dateOfBirth: true,
      address: true,
    });
    const next = validate(form);
    if (next.firstName || next.lastName || Object.keys(next).length > 0) {
      setBanner({
        tone: "error",
        text: "Fix the highlighted fields before opening the file.",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="space-y-5">
      <CompanyPageHeader
        title="Onboard customer"
        backHref="/staff/customers"
        actions={
          <>
            <Link href="/staff/customers" className="company-cta-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              form="onboard-customer-form"
              disabled={mutation.isPending || !canSubmit}
              className="company-cta-primary disabled:opacity-50"
            >
              {mutation.isPending ? "Opening file…" : "Create customer"}
            </button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <form
          id="onboard-customer-form"
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          <CompanyPanel>
            <CompanyPanelHeader title="Legal identity" />
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field
                id="firstName"
                label="First name"
                required
                error={show("firstName") ? errors.firstName : undefined}
              >
                <input
                  id="firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(event) =>
                    setField("firstName", event.target.value)
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, firstName: true }))
                  }
                  placeholder="Ama"
                  className="company-field-input"
                  aria-invalid={show("firstName")}
                />
              </Field>
              <Field
                id="lastName"
                label="Surname"
                required
                error={show("lastName") ? errors.lastName : undefined}
              >
                <input
                  id="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(event) => setField("lastName", event.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, lastName: true }))
                  }
                  placeholder="Asante"
                  className="company-field-input"
                  aria-invalid={show("lastName")}
                />
              </Field>
              <Field
                id="ghanaCardNumber"
                label="Ghana Card"
                error={
                  show("ghanaCardNumber") ? errors.ghanaCardNumber : undefined
                }
                hint="Act 843 identity number, if presented today"
              >
                <input
                  id="ghanaCardNumber"
                  value={form.ghanaCardNumber}
                  onChange={(event) =>
                    setField(
                      "ghanaCardNumber",
                      formatGhanaCard(event.target.value),
                    )
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, ghanaCardNumber: true }))
                  }
                  placeholder="GHA-123456789-0"
                  className="company-field-input font-mono"
                  aria-invalid={show("ghanaCardNumber")}
                />
              </Field>
              <Field
                id="dateOfBirth"
                label="Date of birth"
                error={show("dateOfBirth") ? errors.dateOfBirth : undefined}
              >
                <input
                  id="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) =>
                    setField("dateOfBirth", event.target.value)
                  }
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, dateOfBirth: true }))
                  }
                  className="company-field-input"
                  aria-invalid={show("dateOfBirth")}
                />
              </Field>
            </div>
          </CompanyPanel>

          <CompanyPanel>
            <CompanyPanelHeader title="Contact" />
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field
                id="phone"
                label="Mobile"
                error={show("phone") ? errors.phone : undefined}
                hint="Used for MoMo collections and OTP"
              >
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                  onBlur={() => {
                    if (form.phone.trim()) {
                      setField("phone", normalizeGhPhone(form.phone));
                    }
                    setTouched((prev) => ({ ...prev, phone: true }));
                  }}
                  placeholder="024 123 4567"
                  className="company-field-input"
                  aria-invalid={show("phone")}
                />
              </Field>
              <Field
                id="email"
                label="Email"
                error={show("email") ? errors.email : undefined}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  placeholder="ama@gmail.com"
                  className="company-field-input"
                  aria-invalid={show("email")}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  id="address"
                  label="Residential address"
                  hint="House number, street, and town"
                >
                  <input
                    id="address"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) =>
                      setField("address", event.target.value)
                    }
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, address: true }))
                    }
                    placeholder="H/No. 12, Osu, Accra"
                    className="company-field-input"
                  />
                </Field>
              </div>
            </div>
          </CompanyPanel>

          {banner ? (
            <div
              role="status"
              className={cn(
                "flex items-start gap-2 rounded-[8px] border px-3 py-2.5 text-[13px]",
                banner.tone === "error"
                  ? "border-[#f0d0d4] bg-[#fdf4f5] text-[#9a3d4c] dark:border-[#5a3038] dark:bg-[#2a181c] dark:text-[#f3b4bc]"
                  : "border-[#cfe8d8] bg-[#f3faf6] text-[#2c6b52] dark:border-[#2d4a3a] dark:bg-[#16241d] dark:text-[#b7e4cd]",
              )}
            >
              {banner.tone === "error" ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
              )}
              <p>{banner.text}</p>
            </div>
          ) : null}
        </form>

        <aside className="space-y-5 xl:sticky xl:top-4">
          <CompanyPanel>
            <CompanyPanelHeader title="Member file" />
            <div className="flex items-center gap-3 px-4 py-4">
              <CompanyAvatar
                firstName={form.firstName}
                lastName={form.lastName}
                seed={displayName || "new-member"}
                className="h-11 w-11 text-sm"
              />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-foreground">
                  {displayName || "New saver"}
                </p>
                <p className="truncate text-[12px] text-muted-foreground">
                  {form.phone.trim()
                    ? normalizeGhPhone(form.phone)
                    : "No mobile on file yet"}
                </p>
              </div>
            </div>
            <div className="company-row">
              <span className="company-well company-well-amber">
                <UserPlus className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground">
                  Pending activation
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Wallet opens on create. KYC stays pending until review.
                </p>
              </div>
            </div>
          </CompanyPanel>

          <CompanyPanel>
            <CompanyPanelHeader
              title="File completeness"
              action={
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {readyCount}/{checks.length}
                </span>
              }
            />
            <ul>
              {checks.map((item) => (
                <li key={item.id} className="company-row">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                      item.done
                        ? "bg-[#e5f6ee] text-[#2c6b52] dark:bg-[rgba(52,168,122,0.18)] dark:text-[#b7e4cd]"
                        : "bg-[#f3f5f7] text-muted-foreground dark:bg-white/5",
                    )}
                  >
                    {item.done ? (
                      <Check className="h-3 w-3" weight="bold" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[13px]",
                      item.done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CompanyPanel>

          <CompanyPanel>
            <CompanyPanelHeader title="After you create" />
            <div className="company-row">
              <span className="company-well company-well-sky">
                <IdCard className="h-3.5 w-3.5" />
              </span>
              <p className="text-[12px] leading-5 text-muted-foreground">
                A customer number and wallet are issued. Share the temporary
                password in person and send them to complete Ghana Card photos
                in the app.
              </p>
            </div>
          </CompanyPanel>
        </aside>
      </div>
    </div>
  );
}
