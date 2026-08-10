import { create } from "zustand";
import type { Transaction } from "@/lib/api";

/**
 * Pending deep-link / in-app navigation intent.
 * Used when a push arrives before tabs mount, or when a notification
 * sheet must close before a receipt modal can open (nested Modal bug).
 */
interface DeepLinkState {
  pendingReceipt: Transaction | null;
  setPendingReceipt: (transaction: Transaction | null) => void;
  consumePendingReceipt: () => Transaction | null;
}

export const useDeepLinkStore = create<DeepLinkState>((set, get) => ({
  pendingReceipt: null,
  setPendingReceipt: (transaction) => set({ pendingReceipt: transaction }),
  consumePendingReceipt: () => {
    const next = get().pendingReceipt;
    if (next) set({ pendingReceipt: null });
    return next;
  },
}));
