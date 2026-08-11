import { AppIcon } from "@/components/icons/AppIcon";
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
    <AppIcon
      name="bell"
      size={size}
      color={color ?? colors.foreground}
      weight="fill"
    />
  );
}
