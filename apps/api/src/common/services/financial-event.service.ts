import { Injectable } from "@nestjs/common";
import { PinoLogger, InjectPinoLogger } from "nestjs-pino";

export type FinancialEventType =
  | "deposit.initiated"
  | "deposit.completed"
  | "deposit.failed"
  | "withdrawal.requested"
  | "withdrawal.approved"
  | "withdrawal.rejected"
  | "withdrawal.completed"
  | "withdrawal.disbursement_failed"
  | "withdrawal.disbursement_pending";

export interface FinancialEventPayload {
  event: FinancialEventType;
  tenantId: string;
  transactionId: string;
  reference: string;
  amount: number;
  currency?: string;
  customerId?: string;
  userId?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class FinancialEventService {
  constructor(
    @InjectPinoLogger(FinancialEventService.name)
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext("financial");
  }

  log(payload: FinancialEventPayload): void {
    this.logger.info(
      {
        ...payload,
        currency: payload.currency ?? "GHS",
        category: "financial",
        timestamp: new Date().toISOString(),
      },
      payload.event,
    );
  }
}
