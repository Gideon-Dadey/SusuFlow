export interface InitiatePaymentParams {
  amount: number;
  currency: string;
  reference: string;
  payerPhone: string;
  paymentMethod: string;
  callbackUrl: string;
  description?: string;
}

export interface PaymentSession {
  sessionId: string;
  paymentUrl?: string;
  gatewayReference?: string;
  expiresAt: Date;
}

export interface WebhookEvent {
  reference: string;
  gatewayReference: string;
  status: 'success' | 'failed' | 'pending';
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

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
