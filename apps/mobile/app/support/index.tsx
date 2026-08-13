import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { StackNavHeader } from "@/components/navigation/StackNavHeader";
import { SUPPORT_TOPICS } from "@/lib/support-assistant";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";
import { layout, radius, spacing, typography } from "@/theme/tokens";

export default function SupportHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const pageBg = bankChrome.pageDark;
  const cardBg = isDark ? authChrome.field : "rgba(255,255,255,0.08)";
  const cardBorder = isDark ? authChrome.fieldBorder : "rgba(255,255,255,0.12)";
  const cardRule = "rgba(255,255,255,0.12)";
  const titleColor = "#FFFFFF";
  const mutedColor = "rgba(255,255,255,0.55)";
  const chevronColor = "rgba(255,255,255,0.45)";
  const outlineIconBorder = "rgba(255,255,255,0.22)";
  const outlineIconBg = "transparent";
  const outlineIconFg = "#FFFFFF";
  const topicIconBg = "rgba(255,255,255,0.12)";

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <StackNavHeader title="Support" ink />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: layout.pageGutter,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
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
            icon="help"
            titleColor={titleColor}
            outlineIconBorder={outlineIconBorder}
            outlineIconBg={outlineIconBg}
            outlineIconFg={outlineIconFg}
            onPress={() => router.push("/support/chat" as Href)}
          />
          <View style={[styles.cardRule, { backgroundColor: cardRule }]} />
          <HubNavRow
            title="Messages"
            icon="chat"
            filled
            titleColor={titleColor}
            outlineIconBorder={outlineIconBorder}
            outlineIconBg={outlineIconBg}
            outlineIconFg={outlineIconFg}
            onPress={() => router.push("/support/messages" as Href)}
          />
          <View style={[styles.cardRule, { backgroundColor: cardRule }]} />
          <HubNavRow
            title="My tickets"
            icon="help"
            titleColor={titleColor}
            outlineIconBorder={outlineIconBorder}
            outlineIconBg={outlineIconBg}
            outlineIconFg={outlineIconFg}
            onPress={() => router.push("/support/tickets" as Href)}
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
                </View>
                <AppIcon name="chevron-right" size={16} color={chevronColor} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: mutedColor }]}>
          How to contact our support team
        </Text>
      </ScrollView>
    </View>
  );
}

function HubNavRow({
  title,
  icon,
  filled,
  onPress,
  titleColor,
  outlineIconBorder,
  outlineIconBg,
  outlineIconFg,
}: {
  title: string;
  icon: "help" | "chat";
  filled?: boolean;
  onPress: () => void;
  titleColor: string;
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
  scroll: {
    flex: 1,
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
  footer: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  cardRule: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 4,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  navCopy: {
    flex: 1,
  },
  navTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 17,
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
  },
  topicTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.82,
  },
});
