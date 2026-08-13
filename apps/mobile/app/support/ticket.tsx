import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackNavHeader } from "@/components/navigation/StackNavHeader";
import { AnalyticsEvents, analytics } from "@/lib/analytics";
import { ApiError, supportApi } from "@/lib/api";
import { SUPPORT_TOPICS, type SupportTopicId } from "@/lib/support-assistant";
import { toast } from "@/stores/toast.store";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { layout, radius, spacing, typography } from "@/theme/tokens";

function isTopicId(value: unknown): value is SupportTopicId {
  return (
    typeof value === "string" &&
    SUPPORT_TOPICS.some((topic) => topic.id === value)
  );
}

export default function SupportTicketScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{
    topic?: string;
    q?: string;
  }>();

  const topic = isTopicId(params.topic) ? params.topic : "general";
  const topicMeta = SUPPORT_TOPICS.find((t) => t.id === topic);
  const starterQuestion = typeof params.q === "string" ? params.q.trim() : "";

  const [subject, setSubject] = useState(
    starterQuestion
      ? starterQuestion.slice(0, 80)
      : topicMeta
        ? `Help with ${topicMeta.title}`
        : "Support request",
  );
  const [body, setBody] = useState(
    starterQuestion ? `I need help with:\n${starterQuestion}\n\n` : "",
  );

  const canSubmit = useMemo(() => {
    return subject.trim().length >= 4 && body.trim().length >= 10;
  }, [subject, body]);

  const mutation = useMutation({
    mutationFn: () =>
      supportApi.createTicket({
        topic,
        subject: subject.trim(),
        body: body.trim(),
        lastChatQuestion: starterQuestion || undefined,
      }),
    onSuccess: (ticket) => {
      analytics.track(AnalyticsEvents.supportTicketCreated, {
        topic,
        ticketId: ticket.id,
      });
      void queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket sent — we’ll reply by email.");
      router.replace("/support/tickets" as never);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not create ticket. Try again.";
      toast.error(message);
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StackNavHeader title="Open a ticket" ink />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: layout.pageGutter,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
          gap: spacing.md,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Topic</Text>
        <View style={styles.topicChip}>
          <Text style={styles.topicChipText}>
            {topicMeta?.title ?? "General"}
          </Text>
        </View>

        <Text style={styles.label}>Subject</Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Short summary"
          placeholderTextColor={authChrome.placeholder}
          style={styles.input}
          maxLength={200}
        />

        <Text style={styles.label}>Message</Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Describe what you need help with…"
          placeholderTextColor={authChrome.placeholder}
          style={[styles.input, styles.bodyInput]}
          multiline
          textAlignVertical="top"
          maxLength={4000}
        />

        <Pressable
          accessibilityRole="button"
          disabled={!canSubmit || mutation.isPending}
          onPress={() => mutation.mutate()}
          style={({ pressed }) => [
            styles.submit,
            (!canSubmit || mutation.isPending) && styles.submitDisabled,
            pressed && canSubmit && !mutation.isPending && styles.pressed,
          ]}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.submitLabel}>Send ticket</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: authChrome.inkMuted,
    marginTop: 4,
  },
  topicChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: authChrome.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
  },
  topicChipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: authChrome.ink,
  },
  input: {
    minHeight: 48,
    borderRadius: authChrome.controlRadius,
    backgroundColor: authChrome.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    color: authChrome.ink,
  },
  bodyInput: {
    minHeight: 140,
  },
  submit: {
    marginTop: spacing.sm,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: {
    opacity: 0.35,
  },
  submitLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: "#000000",
  },
  pressed: {
    opacity: 0.85,
  },
});
