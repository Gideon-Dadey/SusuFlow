import { DeleteAccountContent } from "@/components/settings/sections/security/DeleteAccountContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";

export default function SecurityDeleteScreen() {
  return (
    <SettingsDetailLayout title="Delete account" keyboardAvoid>
      <DeleteAccountContent />
    </SettingsDetailLayout>
  );
}
