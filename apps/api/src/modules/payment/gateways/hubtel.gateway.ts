import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac } from "crypto";
import {
  PaymentGateway,
  InitiatePaymentParams,
  PaymentSession,
  WebhookEvent,
  DisbursementParams,
  DisbursementResult,
} from "./payment-gateway.interface";

@Injectable()
export class HubtelGateway implements PaymentGateway {
  readonly name = "hubtel";
  private readonly logger = new Logger(HubtelGateway.name);

  constructor(private readonly config: ConfigService) {}

  async initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<PaymentSession> {
    const clientId = this.config.get("HUBTEL_CLIENT_ID");
    const isDev = !clientId || this.config.get("NODE_ENV") === "development";
    const isBank = params.paymentMethod === "bank_transfer";

    const bankTransfer =
      isBank && params.bankCode && params.bankName
        ? this.buildBankTransferInstructions(params)
        : undefined;

    if (isDev) {
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
          Authorization: `Basic ${Buffer.from(`${clientId}:${this.config.get("HUBTEL_CLIENT_SECRET")}`).toString("base64")}`,
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
    const secret = this.config.get("HUBTEL_WEBHOOK_SECRET", "");
    const isDev = this.config.get("NODE_ENV") === "development";

    if (!isDev && secret) {
      const expected = createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");
      if (expected !== signature) {
        throw new Error("Invalid webhook signature");
      }
    }

    const data = payload as Record<string, unknown>;
    const inner = (data.Data || data) as Record<string, unknown>;

    return {
      reference: String(inner.ClientReference || inner.clientReference || ""),
      gatewayReference: String(inner.CheckoutId || inner.checkoutId || ""),
      status:
        String(inner.Status || inner.status).toLowerCase() === "success"
          ? "success"
          : "failed",
      amount: Number(inner.Amount || inner.amount || 0),
      payerPhone: String(
        inner.CustomerPhoneNumber || inner.customerMobileNumber || "",
      ),
      rawPayload: payload,
    };
  }

  async disburseFunds(params: DisbursementParams): Promise<DisbursementResult> {
    const isDev = !this.config.get("HUBTEL_CLIENT_ID");

    if (isDev) {
      return {
        success: true,
        gatewayReference: `DISB-MOCK-${params.reference}`,
      };
    }

    return { success: false, message: "Disbursement not yet implemented" };
  }
}
