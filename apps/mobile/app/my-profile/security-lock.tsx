import { AppLockContent } from "@/components/settings/sections/security/AppLockContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";

export default function SecurityLockScreen() {
  return (
    <SettingsDetailLayout title="App lock" keyboardAvoid>
      <AppLockContent />
    </SettingsDetailLayout>
  );
}
