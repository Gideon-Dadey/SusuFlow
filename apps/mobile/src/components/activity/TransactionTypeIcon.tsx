import { AppIcon, type AppIconName } from "@/components/icons/AppIcon";
import { StyleSheet, View } from "react-native";
import type { Transaction } from "@/lib/api";
import { getBankWell } from "@/theme/bankChrome";
import { useTheme } from "@/theme/ThemeProvider";

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
  size = 42,
  iconSize = 17,
}: TransactionTypeIconProps) {
  const { isDark } = useTheme();
  const icon = getTransactionKindIcon(kind);
  const well = getBankWell(kind === "deposit" ? "mint" : "rose", isDark);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: well.bg,
        },
      ]}
    >
      <AppIcon name={icon} size={iconSize} color={well.fg} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
