import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";
import {
  PaymentGateway,
  InitiatePaymentParams,
  PaymentSession,
  WebhookEvent,
  DisbursementParams,
  DisbursementResult,
} from "./payment-gateway.interface";
import { normalizeGhanaMsisdn, toHubtelMomoChannel } from "./momo-channel";

@Injectable()
export class HubtelGateway implements PaymentGateway {
  readonly name = "hubtel";
  private readonly logger = new Logger(HubtelGateway.name);

  constructor(private readonly config: ConfigService) {}

  private isConfigured(): boolean {
    return Boolean(
      this.config.get("HUBTEL_CLIENT_ID") &&
      this.config.get("HUBTEL_CLIENT_SECRET") &&
      this.config.get("HUBTEL_MERCHANT_ACCOUNT"),
    );
  }

  private isProduction(): boolean {
    return this.config.get("NODE_ENV") === "production";
  }

  /**
   * Mock rail only in non-production when Hubtel is unset, or when
   * PAYMENT_GATEWAY_MOCK=true is explicitly set for staging demos.
   * Production never mocks — fail closed if credentials missing.
   */
  private useMockRail(): boolean {
    const forceMock = this.config.get("PAYMENT_GATEWAY_MOCK") === "true";
    if (this.isProduction()) {
      if (forceMock) {
        throw new Error("PAYMENT_GATEWAY_MOCK cannot be enabled in production");
      }
      if (!this.isConfigured()) {
        throw new Error(
          "Hubtel is not configured. Set HUBTEL_CLIENT_ID, HUBTEL_CLIENT_SECRET, and HUBTEL_MERCHANT_ACCOUNT.",
        );
      }
      return false;
    }
    if (forceMock) return true;
    return !this.isConfigured();
  }

  private authHeader(): string {
    const clientId = this.config.get<string>("HUBTEL_CLIENT_ID", "");
    const secret = this.config.get<string>("HUBTEL_CLIENT_SECRET", "");
    return `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`;
  }

  async initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<PaymentSession> {
    const isBank = params.paymentMethod === "bank_transfer";

    const bankTransfer =
      isBank && params.bankCode && params.bankName
        ? this.buildBankTransferInstructions(params)
        : undefined;

    if (this.useMockRail()) {
      this.logger.warn("Hubtel not configured. Using mock payment session");
      return {
        sessionId: `mock_${params.reference}`,
        paymentUrl: `${this.config.get("API_URL", "http://localhost:4000")}/api/v1/payments/mock/${params.reference}`,
        gatewayReference: `HUB-MOCK-${params.reference}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        bankTransfer,
      };
    }

    const response = await fetch(
      "https://api.hubtel.com/v2/pos/onlinecheckout/items/initiate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authHeader(),
        },
        body: JSON.stringify({
          totalAmount: params.amount,
          description:
            params.description ||
            (isBank
              ? `SusuFlow bank deposit (${params.bankName})`
              : "SusuFlow Deposit"),
          callbackUrl: params.callbackUrl,
          returnUrl: params.callbackUrl,
          merchantAccountNumber: this.config.get("HUBTEL_MERCHANT_ACCOUNT"),
          clientReference: params.reference,
          ...(params.payerPhone
            ? { customerMobileNumber: params.payerPhone }
            : {}),
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Hubtel initiate failed: ${response.status} ${body}`);
      throw new Error("Payment provider could not start this deposit");
    }

    const data = (await response.json()) as Record<string, unknown>;
    return {
      sessionId: String(data.checkoutId || data.CheckoutId || ""),
      paymentUrl: String(data.checkoutUrl || data.CheckoutUrl || ""),
      gatewayReference: String(data.checkoutId || data.CheckoutId || ""),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      bankTransfer,
    };
  }

  private buildBankTransferInstructions(
    params: InitiatePaymentParams,
  ): NonNullable<PaymentSession["bankTransfer"]> {
    const accountName = this.config.get<string>("BANK_DEPOSIT_ACCOUNT_NAME");
    const accountNumber = this.config.get<string>(
      "BANK_DEPOSIT_ACCOUNT_NUMBER",
    );
    const configuredBank = this.config.get<string>("BANK_DEPOSIT_BANK_NAME");

    const hasReceivingAccount =
      !!accountName?.trim() && !!accountNumber?.trim();

    return {
      bankCode: params.bankCode!,
      bankName: params.bankName!,
      accountName: hasReceivingAccount ? accountName!.trim() : undefined,
      accountNumber: hasReceivingAccount ? accountNumber!.trim() : undefined,
      narration: params.reference,
      instructions: hasReceivingAccount
        ? `Transfer exactly the deposit amount to ${accountName} (${configuredBank || "SusuFlow settlement"}). Use reference ${params.reference} as the transfer narration. Your wallet updates after we confirm the credit.`
        : `Complete payment securely via the checkout page using ${params.bankName}. Keep reference ${params.reference}. Your wallet updates after the bank confirms.`,
    };
  }

  async verifyWebhook(
    payload: unknown,
    signature: string,
  ): Promise<WebhookEvent> {
    const secret = this.config.get<string>("HUBTEL_WEBHOOK_SECRET", "");
    const allowUnsigned =
      this.config.get("HUBTEL_ALLOW_UNSIGNED_WEBHOOKS") === "true";

    if (this.isProduction() || secret) {
      if (!secret) {
        throw new Error(
          "HUBTEL_WEBHOOK_SECRET is required to verify payment callbacks",
        );
      }
      const expected = createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      const a = Buffer.from(expected);
      const b = Buffer.from(signature || "");
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new Error("Invalid webhook signature");
      }
    } else if (!allowUnsigned) {
      this.logger.warn(
        "Hubtel webhook accepted without signature (dev only). Set HUBTEL_WEBHOOK_SECRET.",
      );
    }

    const data = payload as Record<string, unknown>;
    const inner = (data.Data || data) as Record<string, unknown>;
    const rawStatus = String(
      inner.Status || inner.status || data.ResponseCode || "",
    ).toLowerCase();

    let status: WebhookEvent["status"] = "failed";
    if (
      rawStatus === "success" ||
      rawStatus === "0000" ||
      rawStatus === "paid"
    ) {
      status = "success";
    } else if (
      rawStatus === "pending" ||
      rawStatus === "processing" ||
      rawStatus === "0001"
    ) {
      status = "pending";
    }

    return {
      reference: String(
        inner.ClientReference ||
          inner.clientReference ||
          data.ClientReference ||
          "",
      ),
      gatewayReference: String(
        inner.TransactionId ||
          inner.CheckoutId ||
          inner.checkoutId ||
          inner.NetworkTransactionId ||
          "",
      ),
      status,
      amount: Number(inner.Amount || inner.amount || 0),
      payerPhone: String(
        inner.CustomerPhoneNumber ||
          inner.customerMobileNumber ||
          inner.RecipientMsisdn ||
          "",
      ),
      rawPayload: payload,
    };
  }

  async disburseFunds(params: DisbursementParams): Promise<DisbursementResult> {
    if (this.useMockRail()) {
      this.logger.warn(
        `Mock disbursement for ${params.reference} (${params.amount})`,
      );
      return {
        success: true,
        status: "success",
        gatewayReference: `DISB-MOCK-${params.reference}`,
        message: "Mock disbursement completed",
      };
    }

    const merchant = this.config.get<string>("HUBTEL_MERCHANT_ACCOUNT", "");
    const callbackUrl =
      params.callbackUrl ||
      `${this.config.get("API_URL", "http://localhost:4000")}/api/v1/webhooks/hubtel/disbursement`;

    const body = {
      RecipientName: params.recipientName || "SusuFlow Customer",
      RecipientMsisdn: normalizeGhanaMsisdn(params.phone),
      CustomerEmail: "noreply@susuflow.app",
      Channel: toHubtelMomoChannel(params.paymentMethod),
      Amount: params.amount,
      PrimaryCallbackUrl: callbackUrl,
      Description:
        params.description || `SusuFlow withdrawal ${params.reference}`,
      ClientReference: params.reference,
    };

    const response = await fetch(
      `https://api.hubtel.com/v1/merchantaccount/merchants/${merchant}/send/mobilemoney`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authHeader(),
        },
        body: JSON.stringify(body),
      },
    );

    const rawText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      this.logger.error(
        `Hubtel disbursement HTTP ${response.status}: ${rawText}`,
      );
      return {
        success: false,
        status: "failed",
        message: "Payment provider could not start disbursement",
        rawResponse: data,
      };
    }

    const responseCode = String(data.ResponseCode ?? data.responseCode ?? "");
    const gatewayReference = String(
      data.TransactionId ||
        data.Data ||
        (data.data as Record<string, unknown> | undefined)?.TransactionId ||
        params.reference,
    );

    // 0000 = accepted/success; some networks confirm async via callback.
    if (responseCode === "0000") {
      return {
        success: true,
        status: "success",
        gatewayReference,
        message: String(
          data.Message || data.message || "Disbursement accepted",
        ),
        rawResponse: data,
      };
    }

    if (
      responseCode === "0001" ||
      String(data.Message || "")
        .toLowerCase()
        .includes("pending")
    ) {
      return {
        success: true,
        status: "pending",
        gatewayReference,
        message: String(data.Message || "Disbursement pending confirmation"),
        rawResponse: data,
      };
    }

    this.logger.error(`Hubtel disbursement rejected: ${rawText}`);
    return {
      success: false,
      status: "failed",
      gatewayReference,
      message: String(
        data.Message || data.message || "Disbursement rejected by provider",
      ),
      rawResponse: data,
    };
  }
}
