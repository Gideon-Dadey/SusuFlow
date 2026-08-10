import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import {
  TabScreenHeader,
  TabScreenLayout,
} from "@/components/layout/TabScreen";
import { BankMenuRow } from "@/components/profile/BankProfileMenuRow";
import { getServiceWellFromLegacy } from "@/theme/bankChrome";
import { MORE_SERVICE_ITEMS } from "@/types/more-services";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function MoreServicesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <TabScreenLayout
      bankHeader
      header={<TabScreenHeader title="More Services" onGeometry />}
    >
      <View style={styles.menu}>
        {MORE_SERVICE_ITEMS.map((item, index) => {
          const well = getServiceWellFromLegacy(item.tone, isDark);
          return (
            <BankMenuRow
              key={item.id}
              item={{
                id: item.id,
                icon: item.icon,
                label: item.label,
                subtitle: item.subtitle,
                wellBg: well.bg,
                wellFg: well.fg,
                onPress: () => router.push(item.href),
              }}
              showDivider={index < MORE_SERVICE_ITEMS.length - 1}
            />
          );
        })}
      </View>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  menu: {
    marginHorizontal: -spacing.lg,
  },
});
