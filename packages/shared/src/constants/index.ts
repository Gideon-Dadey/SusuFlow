export const ROLES = {
  SUPER_ADMIN: "super_admin",
  COMPANY_ADMIN: "company_admin",
  ACCOUNT_OFFICER: "account_officer",
  COLLECTOR: "collector",
  CUSTOMER: "customer",
  AUDITOR: "auditor",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

export const ACCOUNT_CODES = {
  PLATFORM_CASH: "1000",
  CUSTOMER_WALLETS: "1100",
  COMMISSIONS_PAYABLE: "1200",
  WITHDRAWALS_PENDING: "2000",
  TRANSACTION_FEE_REVENUE: "4000",
  SUBSCRIPTION_REVENUE: "4100",
  COMMISSION_EXPENSE: "5000",
  GATEWAY_FEES: "5100",
} as const;

export const DEFAULT_CURRENCY = "GHS";
export const MIN_DEPOSIT_AMOUNT = 1;
export const MAX_DEPOSIT_AMOUNT = 50000;
export const MIN_WITHDRAWAL_AMOUNT = 10;
export const MAX_DAILY_WITHDRAWAL = 10000;
export const DEPOSIT_EXPIRY_MINUTES = 15;
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MINUTES = 30;
export const JWT_ACCESS_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "7d";
export const TRIAL_PERIOD_DAYS = 14;

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 600;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_SEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_SENDS_PER_HOUR = 5;

export const SUBSCRIPTION_PLAN_PRICES_GHS: Record<
  "starter" | "growth" | "enterprise",
  number
> = {
  starter: 0,
  growth: 299,
  enterprise: 0,
};

export const TENANT_CHART_OF_ACCOUNTS = [
  {
    code: ACCOUNT_CODES.PLATFORM_CASH,
    name: "Platform Cash",
    accountType: "asset" as const,
  },
  {
    code: ACCOUNT_CODES.CUSTOMER_WALLETS,
    name: "Customer Wallets",
    accountType: "liability" as const,
  },
  {
    code: ACCOUNT_CODES.COMMISSIONS_PAYABLE,
    name: "Collector Commissions Payable",
    accountType: "liability" as const,
  },
  {
    code: ACCOUNT_CODES.WITHDRAWALS_PENDING,
    name: "Withdrawals Pending",
    accountType: "liability" as const,
  },
  {
    code: ACCOUNT_CODES.TRANSACTION_FEE_REVENUE,
    name: "Transaction Fee Revenue",
    accountType: "revenue" as const,
  },
  {
    code: ACCOUNT_CODES.SUBSCRIPTION_REVENUE,
    name: "Subscription Revenue",
    accountType: "revenue" as const,
  },
  {
    code: ACCOUNT_CODES.COMMISSION_EXPENSE,
    name: "Commission Expense",
    accountType: "expense" as const,
  },
  {
    code: ACCOUNT_CODES.GATEWAY_FEES,
    name: "Payment Gateway Fees",
    accountType: "expense" as const,
  },
];
