import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { authChrome } from "@/theme/auth-chrome";
import { typography } from "@/theme/tokens";

interface InkListRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  trailingIcon?: AppIconName;
  onTrailingPress?: () => void;
  /** Accent chevron for interactive rows (brokerage-style). */
  accentChevron?: boolean;
  destructive?: boolean;
  showDivider?: boolean;
}

/** Brokerage-style dark list row for account / personal surfaces. */
export function InkListRow({
  label,
  value,
  onPress,
  trailingIcon,
  onTrailingPress,
  accentChevron = false,
  destructive = false,
  showDivider = true,
}: InkListRowProps) {
  const labelColor = destructive
    ? "#F87171"
    : value
      ? authChrome.inkMuted
      : authChrome.ink;
  const valueColor = authChrome.ink;
  const chevronColor = accentChevron ? "#34D399" : authChrome.inkMuted;

  const content = (
    <View style={styles.row}>
      <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.trailing}>
        {value ? (
          <Text style={[styles.value, { color: valueColor }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {trailingIcon ? (
          <Pressable
            accessibilityRole="button"
            onPress={onTrailingPress ?? onPress}
            hitSlop={10}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <AppIcon name={trailingIcon} size={18} color={chevronColor} />
          </Pressable>
        ) : accentChevron && onPress ? (
          <AppIcon name="chevron-right" size={16} color={chevronColor} />
        ) : null}
      </View>
    </View>
  );

  return (
    <View>
      {onPress && !trailingIcon ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => pressed && styles.pressed}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

interface InkSectionProps {
  title: string;
  children: React.ReactNode;
}

export function InkSection({ title, children }: InkSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 0,
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 17,
    color: authChrome.ink,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    paddingVertical: 12,
    gap: 12,
  },
  label: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    flexShrink: 0,
  },
  trailing: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    minWidth: 0,
  },
  value: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    textAlign: "right",
    flexShrink: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  pressed: {
    opacity: 0.7,
  },
});
