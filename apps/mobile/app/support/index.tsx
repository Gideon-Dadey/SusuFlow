import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { BrandMark } from "@/components/profile/BrandMark";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useProfileData } from "@/components/settings/useProfileData";
import { SUPPORT_TOPICS, greetingForName } from "@/lib/support-assistant";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export default function SupportHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { displayName, initials, avatarUrl } = useProfileData();
  const greeting = greetingForName(displayName);

  const pageBg = isDark ? bankChrome.pageDark : "#F4F5F7";
  const heroBg = bankChrome.pageDark;
  const cardBg = isDark ? authChrome.field : "#FFFFFF";
  const cardBorder = isDark ? authChrome.fieldBorder : "#E5E7EB";
  const cardRule = isDark ? "rgba(255,255,255,0.12)" : "#E5E7EB";
  const titleColor = isDark ? authChrome.ink : "#0F172A";
  const mutedColor = isDark ? authChrome.inkMuted : "#64748B";
  const chevronColor = isDark ? authChrome.inkMuted : "#94A3B8";
  const outlineIconBorder = isDark ? "rgba(255,255,255,0.22)" : "#CBD5E1";
  const outlineIconBg = isDark ? "transparent" : "#FFFFFF";
  const outlineIconFg = isDark ? authChrome.ink : "#111111";
  const closeBtnBg = isDark ? authChrome.field : "#FFFFFF";
  const closeBtnFg = isDark ? authChrome.ink : "#111111";
  const topicIconBg = isDark ? "rgba(255,255,255,0.12)" : bankChrome.pageDark;

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <View
        style={[
          styles.hero,
          { backgroundColor: heroBg, paddingTop: insets.top + spacing.md },
        ]}
      >
        <View style={styles.heroTop}>
          <BrandMark size={24} framed={false} />
          <View style={styles.heroRight}>
            <View style={styles.avatarStack}>
              <UserAvatar
                initials={initials}
                seed={displayName}
                imageUrl={avatarUrl}
                size="sm"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close support"
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: closeBtnBg },
                pressed && styles.pressed,
              ]}
            >
              <AppIcon name="close" size={18} color={closeBtnFg} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.hello}>
          {greeting} <Text style={styles.wave}>👋</Text>
        </Text>
        <Text style={styles.heroPrompt}>How can we help?</Text>
      </View>

      <ScrollView
        style={[styles.sheet, { backgroundColor: pageBg }]}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + 40,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <HubNavRow
            title="Help"
            subtitle="Guides & common questions"
            icon="help"
            titleColor={titleColor}
            mutedColor={mutedColor}
            outlineIconBorder={outlineIconBorder}
            outlineIconBg={outlineIconBg}
            outlineIconFg={outlineIconFg}
            onPress={() => router.push("/support/chat" as Href)}
          />
          <View style={[styles.cardRule, { backgroundColor: cardRule }]} />
          <HubNavRow
            title="Messages"
            subtitle="Chat with SusuFlow support"
            icon="chat"
            filled
            titleColor={titleColor}
            mutedColor={mutedColor}
            outlineIconBorder={outlineIconBorder}
            outlineIconBg={outlineIconBg}
            outlineIconFg={outlineIconFg}
            onPress={() => router.push("/support/messages" as Href)}
          />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.cardTitle, { color: titleColor }]}>
            What do you need help with today?
          </Text>
          {SUPPORT_TOPICS.map((topic, index) => (
            <View key={topic.id}>
              {index > 0 ? (
                <View
                  style={[styles.cardRule, { backgroundColor: cardRule }]}
                />
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/support/chat",
                    params: { topic: topic.id, q: topic.starter },
                  } as Href)
                }
                style={({ pressed }) => [
                  styles.topicRow,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[styles.topicIcon, { backgroundColor: topicIconBg }]}
                >
                  <AppIcon name="help" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.topicCopy}>
                  <Text style={[styles.topicTitle, { color: titleColor }]}>
                    {topic.title}
                  </Text>
                  <Text style={[styles.topicSubtitle, { color: mutedColor }]}>
                    {topic.subtitle}
                  </Text>
                </View>
                <AppIcon name="chevron-right" size={16} color={chevronColor} />
              </Pressable>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.cardTitle, { color: titleColor }]}>
            How to contact our support team
          </Text>
          <Text style={[styles.cardBody, { color: mutedColor }]}>
            Ask general questions in Help anytime. For account-specific issues,
            open Messages or Contact us from More. We never ask for passwords or
            OTPs.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function HubNavRow({
  title,
  subtitle,
  icon,
  filled,
  onPress,
  titleColor,
  mutedColor,
  outlineIconBorder,
  outlineIconBg,
  outlineIconFg,
}: {
  title: string;
  subtitle: string;
  icon: "help" | "chat";
  filled?: boolean;
  onPress: () => void;
  titleColor: string;
  mutedColor: string;
  outlineIconBorder: string;
  outlineIconBg: string;
  outlineIconFg: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.navRow, pressed && styles.pressed]}
    >
      <View style={styles.navCopy}>
        <Text style={[styles.navTitle, { color: titleColor }]}>{title}</Text>
        <Text style={[styles.navSubtitle, { color: mutedColor }]}>
          {subtitle}
        </Text>
      </View>
      <View
        style={[
          styles.navIcon,
          filled
            ? styles.navIconFilled
            : {
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: outlineIconBorder,
                backgroundColor: outlineIconBg,
              },
        ]}
      >
        <AppIcon
          name={icon}
          size={18}
          color={filled ? "#000000" : outlineIconFg}
          weight={filled ? "fill" : "regular"}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  heroRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarStack: {
    flexDirection: "row",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  hello: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  wave: {
    fontSize: 26,
  },
  heroPrompt: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: -0.45,
    marginBottom: spacing.sm,
  },
  sheet: {
    flex: 1,
    marginTop: -12,
  },
  card: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    paddingHorizontal: 4,
    paddingTop: 14,
    paddingBottom: 8,
  },
  cardBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    paddingHorizontal: 4,
    paddingBottom: 14,
  },
  cardRule: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 4,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  navCopy: {
    flex: 1,
    gap: 2,
  },
  navTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 17,
  },
  navSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  navIconFilled: {
    backgroundColor: "#FFFFFF",
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  topicCopy: {
    flex: 1,
    gap: 2,
  },
  topicTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
  },
  topicSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.82,
  },
});
