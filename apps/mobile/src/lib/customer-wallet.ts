import { ApiError, customerApi } from "@/lib/api";

export async function fetchCustomerWallet(customerId: string) {
  try {
    return await customerApi.getWallet(customerId);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { walletId: "", balance: 0, currency: "GHS" };
    }
    throw err;
  }
}
