import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { openSupportEmail } from "@/components/profile/ProfileSettingPrimitives";
import {
  getSupportEmail,
  getSupportPhone,
  getSupportWhatsApp,
  openSupportWhatsAppUrl,
} from "@/lib/config";
import { toast } from "@/stores/toast.store";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { radius, spacing, typography } from "@/theme/tokens";

export default function SupportMessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const email = getSupportEmail();
  const phone = getSupportPhone();
  const whatsapp = getSupportWhatsApp();

  const openWhatsApp = () => {
    const url = openSupportWhatsAppUrl(
      "Hello SusuFlow support — I need help with my account.",
    );
    if (!url) {
      toast.info("WhatsApp support is not configured yet. Email us instead.");
      return;
    }
    void Linking.openURL(url);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 4 }]}>
      <View style={styles.header}>
        <BackArrowButton onPress={() => router.back()} color={authChrome.ink} />
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 40,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Reach a human for account-specific help. We never ask for passwords,
          OTPs, or full card details.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/support/chat",
              params: { topic: "general" },
            } as Href)
          }
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.iconWell}>
            <AppIcon name="chat" size={20} color="#FFFFFF" weight="fill" />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>Start a help chat</Text>
            <Text style={styles.cardSubtitle}>
              Instant answers to general app questions
            </Text>
          </View>
          <AppIcon name="chevron-right" size={16} color={authChrome.inkMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => openSupportEmail()}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.iconWell}>
            <AppIcon name="mail" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>Email support</Text>
            <Text style={styles.cardSubtitle}>{email}</Text>
          </View>
          <AppIcon name="chevron-right" size={16} color={authChrome.inkMuted} />
        </Pressable>

        {whatsapp ? (
          <Pressable
            accessibilityRole="button"
            onPress={openWhatsApp}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconWell}>
              <AppIcon name="whatsapp" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>WhatsApp</Text>
              <Text style={styles.cardSubtitle}>Mon–Fri, 8am–6pm GMT</Text>
            </View>
            <AppIcon
              name="chevron-right"
              size={16}
              color={authChrome.inkMuted}
            />
          </Pressable>
        ) : null}

        {phone ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => Linking.openURL(`tel:${phone}`)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconWell}>
              <AppIcon name="phone" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>Call centre</Text>
              <Text style={styles.cardSubtitle}>{phone}</Text>
            </View>
            <AppIcon
              name="chevron-right"
              size={16}
              color={authChrome.inkMuted}
            />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bankChrome.pageDark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 17,
    color: authChrome.ink,
  },
  headerSide: {
    width: 44,
  },
  lead: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: authChrome.inkMuted,
    marginTop: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: authChrome.field,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    padding: 14,
  },
  iconWell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: authChrome.ink,
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: authChrome.inkMuted,
  },
  pressed: {
    opacity: 0.82,
  },
});
