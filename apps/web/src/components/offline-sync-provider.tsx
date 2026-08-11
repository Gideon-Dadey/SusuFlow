"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Check, Loader2, AlertCircle } from "@/components/icons/phosphor";
import { depositApi } from "@/lib/api";
import { generateTransactionReference } from "@susuflow/shared/client";

export interface QueuedDeposit {
  id: string;
  amount: number;
  paymentMethod: string;
  customerId: string;
  payerPhone: string;
  idempotencyKey: string;
  createdAt: string;
  customerName: string;
  reference: string;
  status: "offline_pending" | "syncing" | "failed";
  errorMessage?: string;
}

interface OfflineSyncContextType {
  queuedDeposits: QueuedDeposit[];
  isOnline: boolean;
  queueDeposit: (deposit: {
    amount: number;
    paymentMethod: string;
    customerId: string;
    payerPhone: string;
    customerName: string;
    idempotencyKey: string;
  }) => QueuedDeposit;
  clearFailedDeposits: () => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(
  undefined,
);

export function OfflineSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queued, setQueued] = useState<QueuedDeposit[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  // Load queue from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const saved = localStorage.getItem("susuflow_queued_deposits");
      if (saved) {
        try {
          setQueued(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse queued deposits", e);
        }
      }
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setToast({
        message: "Internet connection restored! Syncing...",
        type: "success",
      });
      setTimeout(() => setToast(null), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToast({
        message: "Connection lost. Operating in offline mode.",
        type: "error",
      });
      setTimeout(() => setToast(null), 4000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Background Sync Engine
  const processSync = useCallback(async (itemsToSync: QueuedDeposit[]) => {
    if (itemsToSync.length === 0) return;

    setToast({
      message: `Syncing ${itemsToSync.length} queued deposit(s)...`,
      type: "info",
    });

    let successCount = 0;
    let failCount = 0;
    const remaining: QueuedDeposit[] = [];

    // Process one by one to preserve transaction sequences
    for (const item of itemsToSync) {
      try {
        setQueued((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: "syncing" as const } : q,
          ),
        );

        await depositApi.initiate({
          amount: item.amount,
          paymentMethod: item.paymentMethod,
          customerId: item.customerId,
          payerPhone: item.payerPhone,
          idempotencyKey: item.idempotencyKey,
        });

        successCount++;
      } catch (err) {
        console.error("Failed to sync queued deposit", err);
        const errMsg =
          err instanceof Error ? err.message : "Unknown network failure";
        const isNetworkError =
          errMsg.toLowerCase().includes("reach") ||
          errMsg.toLowerCase().includes("fetch") ||
          errMsg.toLowerCase().includes("network");

        if (isNetworkError) {
          remaining.push({ ...item, status: "offline_pending" as const });
        } else {
          failCount++;
          remaining.push({
            ...item,
            status: "failed" as const,
            errorMessage: errMsg,
          });
        }
      }
    }

    setQueued(remaining);
    localStorage.setItem("susuflow_queued_deposits", JSON.stringify(remaining));

    if (successCount > 0) {
      setToast({
        message: `Successfully synced ${successCount} deposit(s)!`,
        type: "success",
      });
      setTimeout(() => setToast(null), 4000);
    } else if (failCount > 0) {
      setToast({
        message: `Sync completed. ${failCount} transaction(s) failed validation.`,
        type: "error",
      });
      setTimeout(() => setToast(null), 5000);
    } else {
      setToast(null);
    }
  }, []);

  // Auto-sync trigger
  useEffect(() => {
    const pendingItems = queued.filter((q) => q.status === "offline_pending");
    if (isOnline && pendingItems.length > 0) {
      processSync(pendingItems);
    }
  }, [isOnline, queued, processSync]);

  const queueDeposit = useCallback(
    (deposit: {
      amount: number;
      paymentMethod: string;
      customerId: string;
      payerPhone: string;
      customerName: string;
      idempotencyKey: string;
    }) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const tempRef = generateTransactionReference();

      const newDeposit: QueuedDeposit = {
        id: tempId,
        amount: deposit.amount,
        paymentMethod: deposit.paymentMethod,
        customerId: deposit.customerId,
        payerPhone: deposit.payerPhone,
        customerName: deposit.customerName,
        idempotencyKey: deposit.idempotencyKey,
        createdAt: new Date().toISOString(),
        reference: tempRef,
        status: "offline_pending" as const,
      };

      setQueued((prev) => {
        const updated = [...prev, newDeposit];
        localStorage.setItem(
          "susuflow_queued_deposits",
          JSON.stringify(updated),
        );
        return updated;
      });

      return newDeposit;
    },
    [],
  );

  const clearFailedDeposits = useCallback(() => {
    setQueued((prev) => {
      const filtered = prev.filter((q) => q.status !== "failed");
      localStorage.setItem(
        "susuflow_queued_deposits",
        JSON.stringify(filtered),
      );
      return filtered;
    });
  }, []);

  return (
    <OfflineSyncContext.Provider
      value={{
        queuedDeposits: queued,
        isOnline,
        queueDeposit,
        clearFailedDeposits,
      }}
    >
      {children}

      {/* Premium Dynamic Sync Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-semibold shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-900/60 dark:text-emerald-300"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/90 dark:border-red-900/60 dark:text-red-300"
                : "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/90 dark:border-amber-900/60 dark:text-amber-300"
          }`}
        >
          {toast.type === "success" && (
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          )}
          {toast.type === "info" && (
            <Loader2 className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (context === undefined) {
    throw new Error(
      "useOfflineSync must be used within an OfflineSyncProvider",
    );
  }
  return context;
}
