import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useRefreshFinancialsOnFocus } from "@/hooks/useRefreshFinancialsOnFocus";

/** Single cache sync for all tab screens — avoids duplicate refetches per tab. */
export function FinancialSessionSync() {
  const { sessionKey } = useCustomerSession();
  useRefreshFinancialsOnFocus(sessionKey);
  return null;
}
