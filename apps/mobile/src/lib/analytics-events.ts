/** Canonical event names — keep funnels consistent. */
export const AnalyticsEvents = {
  loginSuccess: "auth.login_success",
  loginBiometric: "auth.login_biometric",
  registerSuccess: "auth.register_success",
  kycStarted: "kyc.started",
  kycSubmitted: "kyc.submitted",
  depositStarted: "deposit.started",
  depositConfirmed: "deposit.confirmed",
  depositFailed: "deposit.failed",
  withdrawStarted: "withdraw.started",
  withdrawConfirmed: "withdraw.confirmed",
  withdrawFailed: "withdraw.failed",
  supportEscalate: "support.escalate",
  supportTicketCreated: "support.ticket_created",
  appOpened: "app.opened",
} as const;
