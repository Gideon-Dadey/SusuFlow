import { create } from "zustand";

export type BiometricEnrollmentPayload = {
  email: string;
  tenant: string;
  refreshToken: string;
};

interface BiometricStoreState {
  pendingEnrollment: BiometricEnrollmentPayload | null;
  queueEnrollment: (payload: BiometricEnrollmentPayload) => void;
  clearPendingEnrollment: () => void;
}

export const useBiometricStore = create<BiometricStoreState>((set) => ({
  pendingEnrollment: null,
  queueEnrollment: (payload) => set({ pendingEnrollment: payload }),
  clearPendingEnrollment: () => set({ pendingEnrollment: null }),
}));
