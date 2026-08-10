import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  SettingRow,
  openSupportEmail,
} from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import { SettingsDivider } from "@/components/settings/SettingsGroup";
import {
  getSupportEmail,
  getSupportPhone,
  getSupportWhatsApp,
} from "@/lib/config";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

const FAQ_ITEMS = [
  {
    question: "How do I make a deposit?",
    answer: "Tap the green Deposit button on your home screen or tab bar.",
  },
  {
    question: "When can I withdraw?",
    answer:
      "Open Withdraw from Quick Actions on home or from your profile to request a payout.",
  },
  {
    question: "Is my money safe?",
    answer:
      "SusuFlow uses secure, regulated processes to protect your savings.",
  },
];

export function HelpSettingsContent() {
  const { colors } = useTheme();
  const supportEmail = getSupportEmail();
  const supportPhone = getSupportPhone();
  const supportWhatsApp = getSupportWhatsApp();

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={openSupportEmail}
        style={({ pressed }) => [
          styles.supportCard,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.supportIcon}>
          <Ionicons name="chatbubbles" size={22} color="#ffffff" />
        </View>
        <View style={styles.supportCopy}>
          <Text style={styles.supportTitle}>Contact support</Text>
          <Text style={styles.supportSubtitle}>{supportEmail}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="rgba(255,255,255,0.8)"
        />
      </Pressable>

      <SettingsPanel>
        <SettingRow
          icon="call-outline"
          title="Call centre"
          subtitle="Mon–Fri, 8am–6pm GMT"
          onPress={() => Linking.openURL(`tel:${supportPhone}`)}
        />
        <SettingsDivider />
        <SettingRow
          icon="logo-whatsapp"
          title="WhatsApp"
          subtitle="Chat with our team"
          onPress={() => Linking.openURL(`https://wa.me/${supportWhatsApp}`)}
        />
      </SettingsPanel>

      <View style={{ gap: 10 }}>
        <Text style={[styles.faqHeading, { color: colors.mutedForeground }]}>
          FREQUENTLY ASKED
        </Text>
        {FAQ_ITEMS.map((item) => (
          <View
            key={item.question}
            style={[
              styles.faqCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.faqQuestion, { color: colors.heading }]}>
              {item.question}
            </Text>
            <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>
              {item.answer}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  supportCopy: {
    flex: 1,
    gap: 2,
  },
  supportTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.size.sm,
    color: "#ffffff",
  },
  supportSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    color: "rgba(255,255,255,0.85)",
  },
  faqHeading: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.xs,
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  faqCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  faqQuestion: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.size.sm,
  },
  faqAnswer: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
    lineHeight: 18,
  },
});
