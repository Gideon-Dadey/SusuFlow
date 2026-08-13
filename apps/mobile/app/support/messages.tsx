import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { StackNavHeader } from "@/components/navigation/StackNavHeader";
import { openSupportEmail } from "@/components/profile/ProfileSettingPrimitives";
import {
  getSupportPhone,
  getSupportWhatsApp,
  openSupportWhatsAppUrl,
} from "@/lib/config";
import { toast } from "@/stores/toast.store";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { layout, radius, spacing, typography } from "@/theme/tokens";

export default function SupportMessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      <StackNavHeader title="Messages" ink />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.pageGutter,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
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
          </View>
          <AppIcon name="chevron-right" size={16} color={authChrome.inkMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/support/ticket" as Href)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.iconWell}>
            <AppIcon name="support" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>Open an in-app ticket</Text>
          </View>
          <AppIcon name="chevron-right" size={16} color={authChrome.inkMuted} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/support/tickets" as Href)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <View style={styles.iconWell}>
            <AppIcon name="chat" size={20} color="#FFFFFF" weight="fill" />
          </View>
          <View style={styles.copy}>
            <Text style={styles.cardTitle}>My tickets</Text>
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
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: authChrome.ink,
  },
  pressed: {
    opacity: 0.82,
  },
});
