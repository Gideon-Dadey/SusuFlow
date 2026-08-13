import { ChangePasswordContent } from "@/components/settings/sections/security/ChangePasswordContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";

export default function SecurityPasswordScreen() {
  return (
    <SettingsDetailLayout
      title="Change password"
      subtitle="Update the password you use to sign in"
      keyboardAvoid
    >
      <ChangePasswordContent />
    </SettingsDetailLayout>
  );
}
