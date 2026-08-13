import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { BackArrowButton } from "@/components/navigation/BackArrowButton";
import { openSupportEmail } from "@/components/profile/ProfileSettingPrimitives";
import { AnalyticsEvents, analytics } from "@/lib/analytics";
import { openSupportWhatsAppUrl } from "@/lib/config";
import {
  SUPPORT_TOPICS,
  answerSupportQuestion,
  type SupportTopicId,
} from "@/lib/support-assistant";
import { toast } from "@/stores/toast.store";
import { authChrome } from "@/theme/auth-chrome";
import { bankChrome } from "@/theme/bankChrome";
import { spacing, typography } from "@/theme/tokens";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

function isTopicId(value: unknown): value is SupportTopicId {
  return (
    typeof value === "string" &&
    SUPPORT_TOPICS.some((topic) => topic.id === value)
  );
}

export default function SupportChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ topic?: string; q?: string }>();
  const topic = isTopicId(params.topic) ? params.topic : undefined;
  const topicMeta = SUPPORT_TOPICS.find((t) => t.id === topic);
  const starter = typeof params.q === "string" ? params.q : undefined;

  const welcome = useMemo(() => {
    if (topicMeta) {
      return `You’re in ${topicMeta.title}. Ask a general question and I’ll answer from SusuFlow guides. I won’t ask for passwords or OTPs.`;
    }
    return "Ask a general question about SusuFlow — deposits, withdrawals, verification, goals, or navigating the app. For live balances or personal changes, use the in-app screens or Messages.";
  }, [topicMeta]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: welcome },
  ]);
  const [draft, setDraft] = useState("");
  const [showEscalate, setShowEscalate] = useState(false);
  const [lastUserQuestion, setLastUserQuestion] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const starterSent = useRef(false);

  const appendExchange = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };
    const { answer, escalate } = answerSupportQuestion(trimmed, topic);
    const botMsg: ChatMessage = {
      id: `a-${Date.now() + 1}`,
      role: "assistant",
      text: answer,
    };

    setLastUserQuestion(trimmed);
    setShowEscalate(escalate);
    if (escalate) {
      analytics.track(AnalyticsEvents.supportEscalate, {
        topic: topic ?? "general",
      });
    }
    setMessages((prev) => [...prev, userMsg, botMsg]);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const send = () => {
    if (!draft.trim()) return;
    appendExchange(draft);
    setDraft("");
  };

  const contactHuman = () => {
    const body = lastUserQuestion
      ? `Hello SusuFlow support,\n\nI need help with:\n${lastUserQuestion}\n\nSent from the SusuFlow app.`
      : "Hello SusuFlow support — I need help with my account.\n\nSent from the SusuFlow app.";
    const wa = openSupportWhatsAppUrl(body);
    if (wa) {
      void Linking.openURL(wa);
      return;
    }
    openSupportEmail({
      subject: "SusuFlow support request",
      body,
    });
    toast.info("Opening email to support…");
  };

  useEffect(() => {
    if (!starter || starterSent.current) return;
    starterSent.current = true;
    const t = setTimeout(() => {
      appendExchange(starter);
    }, 250);
    return () => clearTimeout(t);
  }, [starter, topic]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <BackArrowButton onPress={() => router.back()} color={authChrome.ink} />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {topicMeta?.title ?? "Help"}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            General questions · secure answers
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() =>
          listRef.current?.scrollToEnd({ animated: true })
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user" ? styles.bubbleUser : styles.bubbleBot,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                item.role === "user"
                  ? styles.bubbleTextUser
                  : styles.bubbleTextBot,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}
      />

      {showEscalate ? (
        <Pressable
          accessibilityRole="button"
          onPress={contactHuman}
          style={({ pressed }) => [
            styles.escalateBtn,
            pressed && styles.pressed,
          ]}
        >
          <AppIcon name="support" size={16} color="#000000" />
          <Text style={styles.escalateLabel}>Contact support</Text>
        </Pressable>
      ) : null}

      <View
        style={[
          styles.composer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Ask a question…"
          placeholderTextColor={authChrome.placeholder}
          style={styles.input}
          multiline
          maxLength={500}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={send}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send message"
          onPress={send}
          disabled={!draft.trim()}
          style={({ pressed }) => [
            styles.sendBtn,
            !draft.trim() && styles.sendDisabled,
            pressed && draft.trim() && styles.pressed,
          ]}
        >
          <AppIcon name="arrow-right" size={18} color="#000000" />
        </Pressable>
      </View>
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
    paddingBottom: spacing.sm,
    gap: 8,
  },
  headerCopy: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 17,
    color: authChrome.ink,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: authChrome.inkMuted,
    marginTop: 2,
  },
  headerSide: {
    width: 44,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 10,
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: "#FFFFFF",
  },
  bubbleBot: {
    alignSelf: "flex-start",
    backgroundColor: authChrome.field,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: authChrome.fieldBorder,
  },
  bubbleText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: "#000000",
  },
  bubbleTextBot: {
    color: authChrome.ink,
  },
  escalateBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  escalateLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: "#000000",
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: spacing.lg,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
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
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sendDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.85,
  },
});
