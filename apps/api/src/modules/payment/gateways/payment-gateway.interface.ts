export interface InitiatePaymentParams {
  amount: number;
  currency: string;
  reference: string;
  payerPhone?: string;
  paymentMethod: string;
  callbackUrl: string;
  description?: string;
  bankCode?: string;
  bankName?: string;
}

export interface BankTransferInstructions {
  bankCode: string;
  bankName: string;
  /** Present when merchant receiving account is configured server-side. */
  accountName?: string;
  accountNumber?: string;
  narration: string;
  instructions: string;
}

export interface PaymentSession {
  sessionId: string;
  paymentUrl?: string;
  gatewayReference?: string;
  expiresAt: Date;
  bankTransfer?: BankTransferInstructions;
}

export interface WebhookEvent {
  reference: string;
  gatewayReference: string;
  status: "success" | "failed" | "pending";
  amount: number;
  payerPhone?: string;
  rawPayload: unknown;
}

export interface DisbursementParams {
  amount: number;
  phone: string;
  reference: string;
  description?: string;
}

export interface DisbursementResult {
  success: boolean;
  gatewayReference?: string;
  message?: string;
}

export interface PaymentGateway {
  readonly name: string;
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentSession>;
  verifyWebhook(payload: unknown, signature: string): Promise<WebhookEvent>;
  disburseFunds(params: DisbursementParams): Promise<DisbursementResult>;
}

export const PAYMENT_GATEWAY = Symbol("PAYMENT_GATEWAY");
