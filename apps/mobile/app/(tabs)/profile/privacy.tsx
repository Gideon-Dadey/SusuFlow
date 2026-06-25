import { LegalDocumentContent } from "@/components/legal/LegalDocumentContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { PRIVACY_POLICY } from "@/content/legal";

export default function PrivacyPolicyScreen() {
  return (
    <SettingsDetailLayout
      title={PRIVACY_POLICY.title}
      subtitle="How we collect, use, and protect your data"
    >
      <LegalDocumentContent document={PRIVACY_POLICY} />
    </SettingsDetailLayout>
  );
}
