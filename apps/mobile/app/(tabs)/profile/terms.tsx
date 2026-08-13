import { LegalDocumentContent } from "@/components/legal/LegalDocumentContent";
import { SettingsDetailLayout } from "@/components/settings/SettingsDetailLayout";
import { TERMS_OF_SERVICE } from "@/content/legal";

export default function TermsOfServiceScreen() {
  return (
    <SettingsDetailLayout title={TERMS_OF_SERVICE.title} surface="ink">
      <LegalDocumentContent document={TERMS_OF_SERVICE} />
    </SettingsDetailLayout>
  );
}
