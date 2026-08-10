/** Ghana banks available for customer bank-transfer deposits (allowlisted). */
export const GHANA_BANKS = [
  { code: "GCB", name: "GCB Bank" },
  { code: "ADB", name: "Agricultural Development Bank" },
  { code: "ABSA", name: "Absa Bank Ghana" },
  { code: "STANBIC", name: "Stanbic Bank Ghana" },
  { code: "SCB", name: "Standard Chartered Bank" },
  { code: "ECOBANK", name: "Ecobank Ghana" },
  { code: "CAL", name: "CalBank" },
  { code: "FIDELITY", name: "Fidelity Bank Ghana" },
  { code: "UBA", name: "United Bank for Africa" },
  { code: "ZENITH", name: "Zenith Bank Ghana" },
  { code: "ACCESS", name: "Access Bank Ghana" },
  { code: "GTBANK", name: "Guaranty Trust Bank" },
  { code: "PRUDENTIAL", name: "Prudential Bank" },
  { code: "NIB", name: "National Investment Bank" },
  { code: "UMB", name: "Universal Merchant Bank" },
  { code: "BOA", name: "Bank of Africa Ghana" },
  { code: "FIRSTATL", name: "First Atlantic Bank" },
  { code: "REPUBLIC", name: "Republic Bank Ghana" },
  { code: "CONSOLIDATED", name: "Consolidated Bank Ghana" },
  { code: "OMNIBSIC", name: "OmniBSIC Bank" },
] as const;

export type GhanaBankCode = (typeof GHANA_BANKS)[number]["code"];

const BANK_BY_CODE = new Map(
  GHANA_BANKS.map((bank) => [bank.code.toUpperCase(), bank]),
);

export function findGhanaBank(code: string | undefined | null) {
  if (!code) return null;
  return BANK_BY_CODE.get(code.trim().toUpperCase()) ?? null;
}

export function isGhanaBankCode(code: string | undefined | null): boolean {
  return findGhanaBank(code) !== null;
}

/** Customer-facing deposit methods that are live for initiate. */
export const LIVE_CUSTOMER_DEPOSIT_METHODS = [
  "mtn_momo",
  "telecel_cash",
  "airteltigo",
  "bank_transfer",
] as const;

export type LiveCustomerDepositMethod =
  (typeof LIVE_CUSTOMER_DEPOSIT_METHODS)[number];

export function isLiveCustomerDepositMethod(
  method: string,
): method is LiveCustomerDepositMethod {
  return (LIVE_CUSTOMER_DEPOSIT_METHODS as readonly string[]).includes(method);
}

export function isMobileMoneyDepositMethod(method: string): boolean {
  return (
    method === "mtn_momo" ||
    method === "telecel_cash" ||
    method === "airteltigo"
  );
}
