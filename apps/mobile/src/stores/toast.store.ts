import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export type ToastPayload = {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
};

interface ToastState {
  current: ToastPayload | null;
  show: (
    message: string,
    options?: { variant?: ToastVariant; durationMs?: number },
  ) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: () => void;
}

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  current: null,

  show: (message, options) => {
    const id = `toast-${Date.now()}-${seq++}`;
    set({
      current: {
        id,
        message: message.trim(),
        variant: options?.variant ?? "info",
        durationMs: options?.durationMs ?? 2800,
      },
    });
  },

  success: (message) =>
    set({
      current: {
        id: `toast-${Date.now()}-${seq++}`,
        message: message.trim(),
        variant: "success",
        durationMs: 2600,
      },
    }),

  error: (message) =>
    set({
      current: {
        id: `toast-${Date.now()}-${seq++}`,
        message: message.trim(),
        variant: "error",
        durationMs: 3400,
      },
    }),

  info: (message) =>
    set({
      current: {
        id: `toast-${Date.now()}-${seq++}`,
        message: message.trim(),
        variant: "info",
        durationMs: 2800,
      },
    }),

  dismiss: () => set({ current: null }),
}));

/** Imperative helpers for non-React call sites. */
export const toast = {
  show: (
    message: string,
    options?: { variant?: ToastVariant; durationMs?: number },
  ) => useToastStore.getState().show(message, options),
  success: (message: string) => useToastStore.getState().success(message),
  error: (message: string) => useToastStore.getState().error(message),
  info: (message: string) => useToastStore.getState().info(message),
  dismiss: () => useToastStore.getState().dismiss(),
};
