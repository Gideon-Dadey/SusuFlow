import { Tabs } from "expo-router";
import { View } from "react-native";
import { CustomTabBar } from "@/components/navigation/CustomTabBar";
import { GlobalOptionsButton } from "@/components/navigation/GlobalOptionsButton";
import { NotificationSync } from "@/components/notifications/NotificationSync";
import { PushNotificationProvider } from "@/components/notifications/PushNotificationProvider";
import { ProfileOptionsPanel } from "@/components/navigation/ProfileOptionsPanel";
import { useTheme } from "@/theme/ThemeProvider";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <PushNotificationProvider>
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
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
        <NotificationSync />
        <GlobalOptionsButton />
        <ProfileOptionsPanel />
      </View>
    </PushNotificationProvider>
  );
}
