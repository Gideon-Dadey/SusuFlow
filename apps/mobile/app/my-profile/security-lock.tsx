import { AppLockContent } from "@/components/settings/sections/security/AppLockContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";

export default function SecurityLockScreen() {
  return (
    <SettingsDetailLayout
      title="App lock"
      subtitle="PIN and biometrics on this device"
      keyboardAvoid
    >
      <AppLockContent />
    </SettingsDetailLayout>
  );
}
