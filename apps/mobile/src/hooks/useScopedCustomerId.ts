import { useCustomerSession } from "@/hooks/useCustomerSession";

/** Customer ID for the currently authenticated user only — never a stale profile. */
export function useScopedCustomerId() {
  const { sessionKey, customerId } = useCustomerSession();
  return sessionKey ? customerId : undefined;
}
