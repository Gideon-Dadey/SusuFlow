import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { StyleSheet, View } from "react-native";
import { getIconAccent } from "@/lib/icon-accents";
import type { Transaction } from "@/lib/api";
import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

export type TransactionKind = "deposit" | "withdrawal";

export function getTransactionKindIcon(kind: TransactionKind): AppIconName {
  return kind === "deposit" ? "arrow-down-left" : "arrow-up-right";
}

export function getTransactionIcon(transaction: Transaction): AppIconName {
  return getTransactionKindIcon(
    transaction.type === "deposit" ? "deposit" : "withdrawal",
  );
}

interface TransactionTypeIconProps {
  kind: TransactionKind;
  size?: number;
  iconSize?: number;
}

export function TransactionTypeIcon({
  kind,
  size = 40,
  iconSize = 17,
}: TransactionTypeIconProps) {
  const { isDark } = useTheme();
  const icon = getTransactionKindIcon(kind);
  const accent = getIconAccent(icon, isDark);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius.lg,
          backgroundColor: accent.bg,
        },
      ]}
    >
      <AppIcon name={icon} size={iconSize} color={accent.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
