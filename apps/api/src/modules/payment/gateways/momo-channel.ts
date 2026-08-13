/** Map SusuFlow payment methods to Hubtel MoMo channel codes. */
export function toHubtelMomoChannel(paymentMethod: string): string {
  switch (paymentMethod) {
    case "mtn_momo":
      return "mtn-gh";
    case "telecel_cash":
      return "vodafone-gh";
    case "airteltigo":
      return "tigo-gh";
    default:
      return "mtn-gh";
  }
}

/** Normalize Ghana MSISDN toward 233XXXXXXXXX where possible. */
export function normalizeGhanaMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length >= 12)
    return digits.slice(0, 12);
  if (digits.startsWith("0") && digits.length >= 10) {
    return `233${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) return `233${digits}`;
  return digits;
}
