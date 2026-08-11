import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppIcon } from "@/components/icons/AppIcon";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  UserAvatar,
  type UserAvatarSize,
} from "@/components/profile/UserAvatar";
import {
  pickAndCompressAvatar,
  presentAvatarActions,
  type AvatarPickSource,
} from "@/lib/avatar";
import { userApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { homeChrome } from "@/components/home/homeChrome";
import { spacing, typography } from "@/theme/tokens";

interface AvatarEditorProps {
  initials: string;
  displayName: string;
  imageUrl?: string | null;
  size?: UserAvatarSize;
  /** Show the text link under the avatar (default true). */
  showActionLabel?: boolean;
  /** Banking profile uses a yellow “+”; account screens keep camera. */
  badgeVariant?: "camera" | "plus";
}

const PLUS_YELLOW = "#F5C518";

export function AvatarEditor({
  initials,
  displayName,
  imageUrl,
  size = "xl",
  showActionLabel = true,
  badgeVariant = "camera",
}: AvatarEditorProps) {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const authUserId = useAuthStore((s) => s.user?.id);
  const [busy, setBusy] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (nextUrl: string | null) =>
      userApi.updateMe({ avatarUrl: nextUrl }),
    onSuccess: (updated) => {
      useAuthStore.setState((state) => ({
        user: state.user
          ? { ...state.user, avatarUrl: updated.avatarUrl ?? null }
          : null,
      }));
      if (authUserId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.userProfile(authUserId),
        });
      }
    },
  });

  const runUpdate = async (nextUrl: string | null) => {
    setBusy(true);
    try {
      await saveMutation.mutateAsync(nextUrl);
    } catch (err) {
      Alert.alert(
        "Could not update photo",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handlePick = async (source: AvatarPickSource) => {
    try {
      setBusy(true);
      const dataUrl = await pickAndCompressAvatar(source);
      if (!dataUrl) {
        setBusy(false);
        return;
      }
      await saveMutation.mutateAsync(dataUrl);
    } catch (err) {
      Alert.alert(
        "Could not update photo",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const openMenu = () => {
    if (busy) return;
    presentAvatarActions({
      hasAvatar: !!imageUrl,
      onLibrary: () => void handlePick("library"),
      onCamera: () => void handlePick("camera"),
      onRemove: () => void runUpdate(null),
    });
  };

  const isPlus = badgeVariant === "plus";
  const camBg = isDark ? "rgba(255,255,255,0.14)" : colors.card;
  const badgeSize = isPlus ? 28 : 30;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change profile photo"
        onPress={openMenu}
        disabled={busy}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <UserAvatar
          initials={initials}
          seed={displayName}
          imageUrl={imageUrl}
          size={size}
          loading={busy}
          showVerified={false}
        />
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: isPlus ? PLUS_YELLOW : camBg,
              borderWidth: isPlus ? 2 : 0,
              borderColor: isDark ? "#000000" : "#FFFFFF",
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator
              size="small"
              color={isPlus ? "#111" : homeChrome.link}
            />
          ) : isPlus ? (
            <AppIcon name="plus" size={12} color="#111111" weight="bold" />
          ) : (
            <AppIcon
              name="camera"
              size={12}
              color={isDark ? "#fff" : colors.foreground}
              weight="fill"
            />
          )}
        </View>
      </Pressable>

      {showActionLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={openMenu}
          disabled={busy}
          hitSlop={8}
        >
          <Text
            style={[
              styles.action,
              { color: isDark ? homeChrome.linkDark : homeChrome.link },
            ]}
          >
            {imageUrl ? "Change photo" : "Add photo"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    fontFamily: typography.roles.title,
    fontSize: typography.size.sm,
  },
  pressed: {
    opacity: 0.88,
  },
});
