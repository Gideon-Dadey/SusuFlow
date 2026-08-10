import {
  ArrowCircleUpIcon,
  ArrowDownLeftIcon,
  BellIcon,
  BuildingIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  ClockIcon,
  CreditCardIcon,
  DeviceMobileIcon,
  DownloadSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
  FileTextIcon,
  FlagIcon,
  GearSixIcon,
  GiftIcon,
  HouseIcon,
  InfoIcon,
  LifebuoyIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  PowerIcon,
  QuestionIcon,
  ReceiptIcon,
  ShareNetworkIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SlidersHorizontalIcon,
  SquaresFourIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  WarningCircleIcon,
  XIcon,
  type Icon,
  type IconProps,
  type IconWeight,
} from "phosphor-react-native";
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
  | "power"
  | "settings"
  | "sliders"
  | "receipt"
  | "file-text"
  | "help"
  | "target"
  | "goals"
  | "more"
  | "deposit"
  | "withdraw"
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
  | "building"
  | "close"
  | "clock"
  | "download"
  | "share";

/**
 * Phosphor icon map — one professional family for Quick Access, tabs, and chrome.
 */
const ICON_MAP: Record<AppIconName, Icon> = {
  home: HouseIcon,
  users: UsersIcon,
  plus: PlusIcon,
  activity: ClockCounterClockwiseIcon,
  profile: UserCircleIcon,
  wallet: WalletIcon,
  deposit: WalletIcon,
  withdraw: ArrowCircleUpIcon,
  user: UserIcon,
  shield: ShieldCheckIcon,
  bell: BellIcon,
  moon: MoonIcon,
  support: LifebuoyIcon,
  info: InfoIcon,
  gift: GiftIcon,
  logout: SignOutIcon,
  power: PowerIcon,
  settings: GearSixIcon,
  sliders: SlidersHorizontalIcon,
  receipt: ReceiptIcon,
  "file-text": FileTextIcon,
  help: QuestionIcon,
  target: FlagIcon,
  goals: FlagIcon,
  more: SquaresFourIcon,
  menu: ListBulletsIcon,
  "chevron-right": CaretRightIcon,
  "chevron-left": CaretLeftIcon,
  "chevron-down": CaretDownIcon,
  "arrow-down-left": ArrowDownLeftIcon,
  "arrow-up-right": ArrowCircleUpIcon,
  eye: EyeIcon,
  "eye-off": EyeSlashIcon,
  "badge-check": CheckCircleIcon,
  search: MagnifyingGlassIcon,
  "alert-circle": WarningCircleIcon,
  smartphone: DeviceMobileIcon,
  "credit-card": CreditCardIcon,
  building: BuildingIcon,
  close: XIcon,
  clock: ClockIcon,
  download: DownloadSimpleIcon,
  share: ShareNetworkIcon,
};

export interface AppIconProps extends Omit<IconProps, "color" | "weight"> {
  name: AppIconName;
  size?: number;
  color?: string;
  /** Phosphor weight. Prefer regular / bold / fill. */
  weight?: IconWeight;
  /** @deprecated Lucide strokeWidth — mapped to Phosphor weight. */
  strokeWidth?: number;
}

function weightFromStroke(strokeWidth?: number): IconWeight {
  if (strokeWidth == null) return "regular";
  if (strokeWidth >= 2.25) return "bold";
  if (strokeWidth <= 1.5) return "light";
  return "regular";
}

export function AppIcon({
  name,
  size = 20,
  color,
  weight,
  strokeWidth,
  ...rest
}: AppIconProps) {
  const { colors } = useTheme();
  const IconComponent = ICON_MAP[name];
  return (
    <IconComponent
      size={size}
      color={color ?? colors.foreground}
      weight={weight ?? weightFromStroke(strokeWidth)}
      {...rest}
    />
  );
}
