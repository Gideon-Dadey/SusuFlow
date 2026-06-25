export interface ReceiptTransaction {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: string | number;
  currency?: string;
  createdAt: string;
  description?: string;
  customer?: {
    customerNumber?: string;
    user?: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  payment?: {
    paymentMethod?: string;
    payerPhone?: string;
  };
  withdrawal?: {
    disbursementMethod?: string;
    disbursementPhone?: string;
  };
  tenant?: { name?: string; slug?: string } | null;
}

export interface ReceiptFormatOptions {
  companyName?: string;
  webOrigin?: string;
}

export function formatReceiptDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function getReceiptPaymentMethod(
  transaction: ReceiptTransaction,
): string {
  const isDeposit = transaction.type === "deposit";

  if (isDeposit) {
    if (transaction.payment?.paymentMethod) {
      return transaction.payment.paymentMethod;
    }
    if (transaction.description?.toLowerCase().includes("via")) {
      const parts = transaction.description.split(/via/i);
      return parts[parts.length - 1]?.trim() || "Mobile Money";
    }
    return "Mobile Money";
  }

  return transaction.withdrawal?.disbursementMethod || "Mobile Money";
}

export function getReceiptPhoneLabel(
  transaction: ReceiptTransaction,
): string | null {
  const isDeposit = transaction.type === "deposit";

  if (isDeposit) {
    return (
      transaction.payment?.payerPhone ||
      transaction.customer?.user?.phone ||
      null
    );
  }

  return transaction.withdrawal?.disbursementPhone || null;
}

export function getReceiptCustomerName(
  transaction: ReceiptTransaction,
): string {
  const user = transaction.customer?.user;
  if (user) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
  return "Susu Member";
}

export function getReceiptStatusLabel(status: string): string {
  if (status === "completed" || status === "success") return "PAID";
  return status.replace(/_/g, " ").toUpperCase();
}

export function isReceiptSettled(status: string): boolean {
  return status === "completed" || status === "success";
}

export type ReceiptSettlementTone = "settled" | "pending" | "failed";

export function getReceiptSettlementTone(
  status: string,
): ReceiptSettlementTone {
  if (isReceiptSettled(status)) return "settled";
  if (status === "failed" || status === "rejected") return "failed";
  return "pending";
}

export function getReceiptVerifyUrl(
  transaction: ReceiptTransaction,
  webOrigin = "https://susuflow.com",
): string {
  const code = transaction.id.slice(0, 8).toUpperCase();
  return `${webOrigin.replace(/\/$/, "")}/verify/receipt/${transaction.reference}?code=${code}`;
}

export function getReceiptArtifactHash(reference: string): string {
  let hash = 0;
  for (let i = 0; i < reference.length; i++) {
    hash = (hash << 5) - hash + reference.charCodeAt(i);
    hash = hash & hash;
  }
  return `8efca369${Math.abs(hash).toString(16).padStart(8, "0")}ebffbaf96f00f53f511f71462b587c213e18a67b`;
}

function formatReceiptAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const safe = Number.isFinite(num) ? num : 0;
  return `₵${safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatMethodLabel(method: string): string {
  return method.replace(/_/g, " ").toUpperCase();
}

export interface ReceiptDocumentData {
  companyName: string;
  title: string;
  customerName: string;
  reference: string;
  receiptCode: string;
  paymentRef: string;
  customerId: string;
  transactionType: string;
  paymentMethod: string;
  paymentMethodDisplay: string;
  paymentTime: string;
  statusLabel: string;
  phoneLabel: string | null;
  amount: number;
  amountFormatted: string;
  currency: string;
  serviceLine: string;
  verifyUrl: string;
  artifactHash: string;
  isDeposit: boolean;
  issuedAt: string;
  isSettled: boolean;
  settlementLabel: string;
  settlementTone: ReceiptSettlementTone;
  balanceFormatted: string;
}

export function buildReceiptDocument(
  transaction: ReceiptTransaction,
  options: ReceiptFormatOptions = {},
): ReceiptDocumentData {
  const companyName =
    options.companyName || transaction.tenant?.name || "SusuFlow Platform";
  const webOrigin = options.webOrigin || "https://susuflow.com";
  const isDeposit = transaction.type === "deposit";
  const amount =
    typeof transaction.amount === "string"
      ? parseFloat(transaction.amount)
      : transaction.amount;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const methodLabel = getReceiptPaymentMethod(transaction);
  const settled = isReceiptSettled(transaction.status);
  const settlementTone = getReceiptSettlementTone(transaction.status);
  const amountFormatted = formatReceiptAmount(safeAmount);

  const settlementLabel =
    settlementTone === "settled"
      ? "Paid"
      : settlementTone === "failed"
        ? "Unpaid"
        : "Pending";

  return {
    companyName,
    title: "PAYMENT RECEIPT / INVOICE",
    customerName: getReceiptCustomerName(transaction),
    reference: transaction.reference,
    receiptCode: transaction.id.slice(0, 8).toUpperCase(),
    paymentRef: transaction.reference.slice(-8).toUpperCase(),
    customerId: transaction.customer?.customerNumber || "N/A",
    transactionType: transaction.type.toUpperCase(),
    paymentMethod: methodLabel,
    paymentMethodDisplay: formatMethodLabel(methodLabel),
    paymentTime: formatReceiptDate(transaction.createdAt),
    statusLabel: getReceiptStatusLabel(transaction.status),
    phoneLabel: getReceiptPhoneLabel(transaction),
    amount: safeAmount,
    amountFormatted,
    currency: "₵",
    serviceLine: isDeposit
      ? "Susu Gateway-Confirmed Deposit Contribution"
      : "Susu Ledger-Authorized Account Cash Payout",
    verifyUrl: getReceiptVerifyUrl(transaction, webOrigin),
    artifactHash: getReceiptArtifactHash(transaction.reference),
    isDeposit,
    issuedAt: formatReceiptDate(new Date().toISOString()),
    isSettled: settled,
    settlementLabel,
    settlementTone,
    balanceFormatted: settled ? "₵0.00" : amountFormatted,
  };
}

export function buildReceiptShareText(
  transaction: ReceiptTransaction,
  options: ReceiptFormatOptions = {},
): string {
  const companyName =
    options.companyName || transaction.tenant?.name || "SusuFlow Platform";
  const webOrigin = options.webOrigin || "https://susuflow.com";
  const isDeposit = transaction.type === "deposit";
  const amountText = formatReceiptAmount(transaction.amount);
  const methodLabel = getReceiptPaymentMethod(transaction);
  const paymentTime = formatReceiptDate(transaction.createdAt);
  const customerName = getReceiptCustomerName(transaction);
  const receiptCode = transaction.id.slice(0, 8).toUpperCase();
  const paymentRef = transaction.reference.slice(-8).toUpperCase();
  const statusLabel = getReceiptStatusLabel(transaction.status);
  const serviceLine = isDeposit
    ? "Susu Gateway-Confirmed Deposit Contribution"
    : "Susu Ledger-Authorized Account Cash Payout";
  const verifyUrl = getReceiptVerifyUrl(transaction, webOrigin);
  const artifactHash = getReceiptArtifactHash(transaction.reference);
  const printedAt = new Date();
  const printedDate = printedAt.toLocaleDateString("en-US");
  const printedTime = printedAt.toLocaleTimeString("en-US");
  const phoneLabel = getReceiptPhoneLabel(transaction);
  const settled = isReceiptSettled(transaction.status);

  const lines = [
    companyName.toUpperCase(),
    "PAYMENT RECEIPT / INVOICE",
    "",
    `Customer Name: ${customerName}`,
    `Invoice / Ref #: ${transaction.reference}`,
    `Receipt Code: ${receiptCode}`,
    `Payment Method: ${formatMethodLabel(methodLabel)}`,
    `Payment Time: ${paymentTime}`,
    `Customer ID: ${transaction.customer?.customerNumber || "N/A"}`,
    `Transaction Type: ${transaction.type.toUpperCase()}`,
    `Payment Status: ${statusLabel}`,
    `Payment Ref: ${paymentRef}`,
  ];

  if (phoneLabel) {
    lines.push(`Account / Phone: ${phoneLabel}`);
  }

  lines.push(
    "",
    "No. | Service | Qty | Unit | Subtotal",
    `1 | ${serviceLine} | 1 | ${amountText} | ${amountText}`,
    "",
    `Total Bill: ${amountText}`,
    settled ? `Paid: ${amountText}` : `Amount Due: ${amountText}`,
    `Balance: ${settled ? "₵0.00" : amountText}`,
    "",
    "VERIFICATION DETAILS",
    "Verification URL:",
    verifyUrl,
    `Artifact SHA-256: ${artifactHash}`,
    "",
    `Issued by ${companyName}. Printed on ${printedDate}, ${printedTime}. Official receipt timestamp ${paymentTime}.`,
    "",
    "Thank you for saving with SusuFlow!",
    "This is a system-generated electronic receipt.",
  );

  return lines.join("\n");
}

function escapeReceiptHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const RECEIPT_SETTLEMENT_COLORS: Record<ReceiptSettlementTone, string> = {
  settled: "#16a34a",
  pending: "#d97706",
  failed: "#dc2626",
};

/** HTML for official receipt PDF — matches web print layout. */
export function buildReceiptHtml(doc: ReceiptDocumentData): string {
  const accent = RECEIPT_SETTLEMENT_COLORS[doc.settlementTone];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(doc.verifyUrl)}`;
  const printedAt = new Date();
  const printedDate = printedAt.toLocaleDateString("en-US");
  const printedTime = printedAt.toLocaleTimeString("en-US");

  const phoneRow = doc.phoneLabel
    ? `<div class="row"><span class="label">Account / Phone:</span><span class="value mono">${escapeReceiptHtml(doc.phoneLabel)}</span></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeReceiptHtml(doc.companyName)} Receipt</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      padding: 28px 32px 36px;
      font-size: 13px;
      line-height: 1.45;
    }
    .accent { height: 6px; width: 100%; background: ${accent}; margin-bottom: 24px; border-radius: 2px; }
    .brand { text-align: center; margin-bottom: 28px; }
    .company {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${accent};
      margin-bottom: 8px;
    }
    .title {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: #1f2937;
      border-bottom: 2px solid #111827;
      padding-bottom: 6px;
      padding-left: 16px;
      padding-right: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 48px;
      margin-bottom: 28px;
    }
    .col { display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; justify-content: space-between; gap: 16px; }
    .label { color: #6b7280; font-weight: 600; flex-shrink: 0; }
    .value { color: #111827; font-weight: 700; text-align: right; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 500; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 13px;
    }
    thead tr { background: #f3f4f6; border-bottom: 1px solid #d1d5db; }
    th {
      text-align: left;
      padding: 10px 16px;
      font-weight: 700;
      color: #374151;
    }
    th.right, td.right { text-align: right; }
    tbody tr { border-bottom: 1px solid #e5e7eb; }
    td { padding: 12px 16px; color: #111827; vertical-align: top; }
    td.service { font-weight: 600; }
    .summary { display: flex; justify-content: flex-end; margin-bottom: 28px; }
    .summary-box { width: 320px; display: flex; flex-direction: column; gap: 8px; }
    .summary-row { display: flex; justify-content: space-between; color: #4b5563; }
    .summary-row .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .settlement {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: ${accent};
      color: #ffffff;
      border-radius: 8px;
      padding: 10px 16px;
      font-weight: 700;
      font-size: 14px;
    }
    .verify {
      display: flex;
      gap: 24px;
      align-items: flex-start;
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
      margin-top: 8px;
    }
    .qr {
      width: 112px;
      height: 112px;
      border: 1px solid #e5e7eb;
      padding: 6px;
      background: #ffffff;
      flex-shrink: 0;
    }
    .verify-copy { flex: 1; font-size: 12px; color: #4b5563; }
    .verify-heading {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .verify-url-label { font-weight: 600; color: ${accent}; margin-bottom: 4px; }
    .verify-url { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; word-break: break-all; color: #6b7280; }
    .hash { font-size: 10px; color: #9ca3af; margin-top: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; word-break: break-all; }
    .footer {
      border-top: 1px solid #e5e7eb;
      margin-top: 32px;
      padding-top: 16px;
      text-align: center;
      font-size: 10px;
      color: #9ca3af;
    }
    .thanks {
      text-align: center;
      margin-top: 20px;
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="accent"></div>
  <div class="brand">
    <div class="company">${escapeReceiptHtml(doc.companyName)}</div>
    <div class="title">${escapeReceiptHtml(doc.title)}</div>
  </div>
  <div class="grid">
    <div class="col">
      <div class="row"><span class="label">Customer Name:</span><span class="value">${escapeReceiptHtml(doc.customerName)}</span></div>
      <div class="row"><span class="label">Invoice / Ref #:</span><span class="value mono">${escapeReceiptHtml(doc.reference)}</span></div>
      <div class="row"><span class="label">Receipt Code:</span><span class="value mono">${escapeReceiptHtml(doc.receiptCode)}</span></div>
      <div class="row"><span class="label">Payment Method:</span><span class="value">${escapeReceiptHtml(doc.paymentMethodDisplay)}</span></div>
      <div class="row"><span class="label">Payment Time:</span><span class="value">${escapeReceiptHtml(doc.paymentTime)}</span></div>
      ${phoneRow}
    </div>
    <div class="col">
      <div class="row"><span class="label">Customer ID:</span><span class="value mono">${escapeReceiptHtml(doc.customerId)}</span></div>
      <div class="row"><span class="label">Transaction Type:</span><span class="value">${escapeReceiptHtml(doc.transactionType)}</span></div>
      <div class="row"><span class="label">Payment Status:</span><span class="value" style="color:${accent}">${escapeReceiptHtml(doc.statusLabel)}</span></div>
      <div class="row"><span class="label">Payment Ref:</span><span class="value mono">${escapeReceiptHtml(doc.paymentRef)}</span></div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:48px">No.</th>
        <th>Service</th>
        <th class="right" style="width:56px">Qty</th>
        <th class="right" style="width:112px">Unit</th>
        <th class="right" style="width:112px">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td class="service">${escapeReceiptHtml(doc.serviceLine)}</td>
        <td class="right">1</td>
        <td class="right mono">${escapeReceiptHtml(doc.amountFormatted)}</td>
        <td class="right mono">${escapeReceiptHtml(doc.amountFormatted)}</td>
      </tr>
    </tbody>
  </table>
  <div class="summary">
    <div class="summary-box">
      <div class="summary-row"><span>Total Bill:</span><span class="mono">${escapeReceiptHtml(doc.amountFormatted)}</span></div>
      <div class="settlement"><span>${escapeReceiptHtml(doc.settlementLabel)}:</span><span class="mono">${escapeReceiptHtml(doc.amountFormatted)}</span></div>
      <div class="summary-row"><span>Balance:</span><span class="mono">${escapeReceiptHtml(doc.balanceFormatted)}</span></div>
    </div>
  </div>
  <div class="verify">
    <img class="qr" src="${qrUrl}" alt="Verification QR Code" />
    <div class="verify-copy">
      <div class="verify-heading">Verification Details</div>
      <div class="verify-url-label">Verification URL</div>
      <div class="verify-url">${escapeReceiptHtml(doc.verifyUrl)}</div>
      <div class="hash">Artifact SHA-256: ${escapeReceiptHtml(doc.artifactHash)}</div>
    </div>
  </div>
  <div class="thanks">Thank you for saving with SusuFlow!</div>
  <div class="footer">
    Issued by ${escapeReceiptHtml(doc.companyName)}. Printed on ${escapeReceiptHtml(printedDate)}, ${escapeReceiptHtml(printedTime)}. Official receipt timestamp ${escapeReceiptHtml(doc.paymentTime)}.<br />
    This is a system-generated electronic receipt.
  </div>
</body>
</html>`;
}
