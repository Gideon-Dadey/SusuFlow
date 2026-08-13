import { Tabs } from "expo-router";
import { View } from "react-native";
import { FinancialSessionSync } from "@/components/layout/FinancialSessionSync";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";
import { NotificationSync } from "@/components/notifications/NotificationSync";
import { useTheme } from "@/theme/ThemeProvider";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="plans" options={{ title: "Goals" }} />
        <Tabs.Screen
          name="deposit"
          options={{ title: "Deposit", href: null }}
        />
        <Tabs.Screen
          name="withdraw"
          options={{ title: "Withdraw", href: null }}
        />
        <Tabs.Screen name="activity" options={{ title: "Activity" }} />
        <Tabs.Screen name="profile" options={{ title: "More" }} />
      </Tabs>
      <NotificationSync />
      <FinancialSessionSync />
    </View>
  );
}
