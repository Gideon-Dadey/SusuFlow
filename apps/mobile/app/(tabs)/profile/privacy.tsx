import { LegalDocumentContent } from "@/components/legal/LegalDocumentContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PRIVACY_POLICY } from "@/content/legal";

export default function PrivacyPolicyScreen() {
  return (
    <SettingsDetailLayout title={PRIVACY_POLICY.title} surface="ink">
      <LegalDocumentContent document={PRIVACY_POLICY} />
    </SettingsDetailLayout>
  );
}
