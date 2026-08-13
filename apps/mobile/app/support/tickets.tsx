import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { StackNavHeader } from "@/components/navigation/StackNavHeader";
import { supportApi } from "@/lib/api";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { layout, radius, spacing, typography } from "@/theme/tokens";

function statusLabel(status: string) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export default function SupportTicketsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const query = useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => supportApi.listTickets(),
  });

  const tickets = query.data ?? [];

  return (
    <View style={styles.root}>
      <StackNavHeader title="My tickets" ink />

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
          onPress={() => router.push("/support/ticket" as Href)}
          style={({ pressed }) => [styles.newBtn, pressed && styles.pressed]}
        >
          <AppIcon name="support" size={16} color="#000000" />
          <Text style={styles.newBtnLabel}>New ticket</Text>
        </Pressable>

        {query.isLoading ? (
          <ActivityIndicator color="#FFFFFF" style={{ marginTop: 24 }} />
        ) : null}

        {query.isError ? (
          <Text style={styles.empty}>
            Couldn’t load tickets. Pull back and try again.
          </Text>
        ) : null}

        {!query.isLoading && !query.isError && tickets.length === 0 ? (
          <Text style={styles.empty}>
            No tickets yet. Open one when the FAQ can’t solve it — support is
            notified by email.
          </Text>
        ) : null}

        {tickets.map((ticket) => (
          <View key={ticket.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {ticket.subject}
              </Text>
              <Text style={styles.status}>{statusLabel(ticket.status)}</Text>
            </View>
            <Text style={styles.meta}>
              {ticket.topic} ·{" "}
              {new Date(ticket.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
            <Text style={styles.body} numberOfLines={3}>
              {ticket.body}
            </Text>
          </View>
        ))}
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
  newBtn: {
    marginTop: spacing.sm,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  newBtnLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: "#000000",
  },
  empty: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: authChrome.inkMuted,
  },
  card: {
    backgroundColor: authChrome.field,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    padding: 14,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: authChrome.ink,
  },
  status: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: authChrome.inkMuted,
  },
  meta: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: authChrome.inkMuted,
  },
  body: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: authChrome.ink,
  },
  pressed: {
    opacity: 0.85,
  },
});
