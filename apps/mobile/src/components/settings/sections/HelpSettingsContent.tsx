import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";
import {
  SettingRow,
  openSupportEmail,
} from "@/components/profile/ProfileSections";
import { SettingsPanel } from "@/components/settings/SettingsDetailLayout";
import {
  getSupportEmail,
  getSupportPhone,
  getSupportWhatsApp,
} from "@/lib/config";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";

const FAQ_ITEMS = [
  {
    question: "How do I make a deposit?",
    answer:
      "Use Deposit from the tab bar, Quick access on Home, or the Deposit FAB.",
  },
  {
    question: "When can I withdraw?",
    answer: "Open Withdraw from Quick access on Home to request a payout.",
  },
  {
    question: "Is my money safe?",
    answer:
      "SusuFlow uses secure, regulated processes to protect your savings.",
  },
];

export function HelpSettingsContent() {
  const { colors, isDark } = useTheme();
  const supportEmail = getSupportEmail();
  const supportPhone = getSupportPhone();
  const supportWhatsApp = getSupportWhatsApp();

  /** Light: solid black CTA. Dark: raised charcoal card so it separates from the page. */
  const cardBg = isDark ? "#1A1A1A" : "#000000";
  const cardBorder = isDark ? bankChrome.dividerDark : "transparent";
  const subtitleColor = isDark
    ? "rgba(255,255,255,0.72)"
    : "rgba(255,255,255,0.85)";
  const iconWell = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.18)";

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => openSupportEmail()}
        style={({ pressed }) => [
          styles.supportCard,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={[styles.supportIcon, { backgroundColor: iconWell }]}>
          <AppIcon name="support" size={22} color="#FFFFFF" weight="fill" />
        </View>
        <View style={styles.supportCopy}>
          <Text style={styles.supportTitle}>Contact support</Text>
          <Text style={[styles.supportSubtitle, { color: subtitleColor }]}>
            {supportEmail}
          </Text>
        </View>
        <AppIcon
          name="chevron-right"
          size={18}
          color={isDark ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.8)"}
        />
      </Pressable>

      {supportPhone || supportWhatsApp ? (
        <SettingsPanel>
          {supportPhone ? (
            <SettingRow
              icon="phone"
              title="Call centre"
              subtitle="Mon–Fri, 8am–6pm GMT"
              onPress={() => Linking.openURL(`tel:${supportPhone}`)}
              showDivider={Boolean(supportWhatsApp)}
            />
          ) : null}
          {supportWhatsApp ? (
            <SettingRow
              icon="whatsapp"
              title="WhatsApp"
              subtitle="Chat with our team"
              onPress={() =>
                Linking.openURL(`https://wa.me/${supportWhatsApp}`)
              }
              showDivider={false}
            />
          ) : null}
        </SettingsPanel>
      ) : null}

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
    color: "#FFFFFF",
  },
  supportSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.size.xs,
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
