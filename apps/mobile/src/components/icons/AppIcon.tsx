import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  BadgeCheck,
  CircleHelp,
  Eye,
  EyeOff,
  FileText,
  Gift,
  Home,
  Info,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Target,
  User,
  UserRound,
  Users,
  Wallet,
  X,
  type LucideProps,
} from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export type AppIconName =
  | "home"
  | "users"
  | "plus"
  | "activity"
  | "profile"
  | "wallet"
  | "user"
  | "shield"
  | "bell"
  | "moon"
  | "support"
  | "info"
  | "gift"
  | "logout"
  | "receipt"
  | "file-text"
  | "help"
  | "target"
  | "menu"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "arrow-down-left"
  | "arrow-up-right"
  | "eye"
  | "eye-off"
  | "badge-check"
  | "search"
  | "alert-circle"
  | "smartphone"
  | "credit-card"
  | "close";

const ICON_MAP = {
  home: Home,
  users: Users,
  plus: Plus,
  activity: Activity,
  profile: UserRound,
  wallet: Wallet,
  user: User,
  shield: ShieldCheck,
  bell: Bell,
  moon: Moon,
  support: LifeBuoy,
  info: Info,
  gift: Gift,
  logout: LogOut,
  receipt: Receipt,
  "file-text": FileText,
  help: CircleHelp,
  target: Target,
  menu: Menu,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  "chevron-down": ChevronDown,
  "arrow-down-left": ArrowDownLeft,
  "arrow-up-right": ArrowUpRight,
  eye: Eye,
  "eye-off": EyeOff,
  "badge-check": BadgeCheck,
  search: Search,
  "alert-circle": AlertCircle,
  smartphone: Smartphone,
  "credit-card": CreditCard,
  close: X,
} as const;

export interface AppIconProps extends Omit<LucideProps, "color"> {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function AppIcon({
  name,
  size = 20,
  color,
  strokeWidth = 1.75,
  ...rest
}: AppIconProps) {
  const { colors } = useTheme();
  const Icon = ICON_MAP[name];
  return (
    <Icon
      size={size}
      color={color ?? colors.foreground}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}
