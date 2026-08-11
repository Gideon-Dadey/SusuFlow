import {
  buildReceiptDocument,
  buildReceiptHtml,
  buildReceiptShareText,
  getReceiptArtifactHash,
  getReceiptVerifyUrl,
} from "./receipt";

const sampleTransaction = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  reference: "48291037",
  type: "deposit",
  status: "completed",
  amount: 150.5,
  currency: "GHS",
  createdAt: "2024-06-24T10:30:00.000Z",
  customer: {
    customerNumber: "CUS-000042",
    user: {
      firstName: "Ama",
      lastName: "Mensah",
      phone: "+233241234567",
    },
  },
  payment: {
    paymentMethod: "mobile_money",
    payerPhone: "+233241234567",
  },
  tenant: { name: "Apex Susu", slug: "apex-susu" },
};

describe("receipt utils", () => {
  it("builds a share text block with invoice details", () => {
    const text = buildReceiptShareText(sampleTransaction, {
      companyName: "Apex Susu",
      webOrigin: "https://apex-susu.susuflow.com",
    });

    expect(text).toContain("APEX SUSU");
    expect(text).toContain("PAYMENT RECEIPT / INVOICE");
    expect(text).toContain("Customer Name: Ama Mensah");
    expect(text).toContain("Invoice / Ref #: 48291037");
    expect(text).toContain("Payment Ref: 48291037");
    expect(text).toContain("Receipt Code: A1B2C3D4");
    expect(text).toContain("Payment Status: PAID");
    expect(text).toContain("Susu Gateway-Confirmed Deposit Contribution");
    expect(text).toContain("₵150.50");
    expect(text).toContain(
      "https://apex-susu.susuflow.com/verify/receipt/48291037?code=A1B2C3D4",
    );
  });

  it("creates stable artifact hash from reference", () => {
    const hash = getReceiptArtifactHash("48291037");
    expect(hash).toMatch(
      /^8efca369[0-9a-f]{8}ebffbaf96f00f53f511f71462b587c213e18a67b$/,
    );
    expect(getReceiptArtifactHash("48291037")).toBe(hash);
  });

  it("builds verify url with receipt code", () => {
    expect(getReceiptVerifyUrl(sampleTransaction, "https://susuflow.com")).toBe(
      "https://susuflow.com/verify/receipt/48291037?code=A1B2C3D4",
    );
  });

  it("marks pending transactions as not settled in receipt document", () => {
    const pending = { ...sampleTransaction, status: "pending" };
    const doc = buildReceiptDocument(pending, {
      companyName: "Apex Susu",
      webOrigin: "https://apex-susu.susuflow.com",
    });

    expect(doc.isSettled).toBe(false);
    expect(doc.settlementTone).toBe("pending");
    expect(doc.settlementLabel).toBe("Pending");
    expect(doc.balanceFormatted).toBe("₵150.50");
  });

  it("uses amount due wording for pending share text", () => {
    const pending = { ...sampleTransaction, status: "pending" };
    const text = buildReceiptShareText(pending, {
      companyName: "Apex Susu",
      webOrigin: "https://apex-susu.susuflow.com",
    });

    expect(text).toContain("Amount Due: ₵150.50");
    expect(text).toContain("Balance: ₵150.50");
    expect(text).not.toContain("Paid: ₵150.50");
  });

  it("builds printable html aligned with official receipt layout", () => {
    const doc = buildReceiptDocument(sampleTransaction, {
      companyName: "Apex Susu",
      webOrigin: "https://apex-susu.susuflow.com",
    });
    const html = buildReceiptHtml(doc);

    expect(html).toContain("PAYMENT RECEIPT / INVOICE");
    expect(html).toContain("Ama Mensah");
    expect(html).toContain("48291037");
    expect(html).toContain("Susu Gateway-Confirmed Deposit Contribution");
    expect(html).toContain("₵150.50");
    expect(html).toContain("api.qrserver.com");
    expect(html).toContain(doc.verifyUrl);
  });
});
