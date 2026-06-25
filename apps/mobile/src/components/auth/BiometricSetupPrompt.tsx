import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getBiometricSupport,
  saveBiometricSession,
  type BiometricSupport,
} from "@/lib/biometric";
import { useBiometricStore } from "@/stores/biometric.store";

export function BiometricSetupPrompt() {
  const pending = useBiometricStore((s) => s.pendingEnrollment);
  const clearPending = useBiometricStore((s) => s.clearPendingEnrollment);
  const [support, setSupport] = useState<BiometricSupport | null>(null);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (!pending) return;
    void getBiometricSupport().then(setSupport);
  }, [pending]);

  if (!pending || !support?.available) return null;

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await saveBiometricSession(pending, support.label);
    } finally {
      setEnabling(false);
      clearPending();
    }
  };

  return (
    <ConfirmDialog
      visible
      message={`Enable ${support.label} for quick, secure sign-in on this device?`}
      confirmLabel="Enable"
      cancelLabel="Not now"
      loading={enabling}
      onConfirm={handleEnable}
      onCancel={clearPending}
    />
  );
}
