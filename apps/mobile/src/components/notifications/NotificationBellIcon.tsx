import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";

interface NotificationBellIconProps {
  size?: number;
  color?: string;
}

export function NotificationBellIcon({
  size = 22,
  color,
}: NotificationBellIconProps) {
  const { colors } = useTheme();

  return (
    <FontAwesome6
      name="bell"
      size={size}
      color={color ?? colors.foreground}
      solid
    />
  );
}
