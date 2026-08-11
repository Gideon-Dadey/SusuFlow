export const ANDROID_PUSH_CHANNELS = {
  transactions: "transactions",
  identity: "identity",
  security: "security",
  account: "account",
} as const;

export type AndroidPushChannelId =
  (typeof ANDROID_PUSH_CHANNELS)[keyof typeof ANDROID_PUSH_CHANNELS];

export const PUSH_CATEGORIES = [
  "transactions",
  "identity",
  "security",
  "account",
] as const;

export type PushCategory = (typeof PUSH_CATEGORIES)[number];

export const PUSH_EVENTS = [
  "deposit-initiated",
  "deposit-confirmed",
  "deposit-failed",
  "withdrawal-requested",
  "withdrawal-approved",
  "withdrawal-completed",
  "withdrawal-rejected",
  "kyc-approved",
  "kyc-rejected",
  "security-new-login",
  "security-account-locked",
  "password-changed",
  "push-test",
] as const;

export type PushEventName = (typeof PUSH_EVENTS)[number];

export interface NotificationPreferenceState {
  pushEnabled: boolean;
  transactions: boolean;
  identity: boolean;
  /** Security alerts cannot be turned off. */
  security: true;
  account: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceState = {
  pushEnabled: true,
  transactions: true,
  identity: true,
  security: true,
  account: true,
};

const EVENT_META: Record<
  PushEventName,
  {
    category: PushCategory;
    channelId: AndroidPushChannelId;
    screen: "activity" | "kyc" | "security" | "home";
    interruptionLevel: "passive" | "active" | "time-sensitive";
  }
> = {
  "deposit-initiated": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "time-sensitive",
  },
  "deposit-confirmed": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "time-sensitive",
  },
  "deposit-failed": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "time-sensitive",
  },
  "withdrawal-requested": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "active",
  },
  "withdrawal-approved": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "time-sensitive",
  },
  "withdrawal-completed": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "time-sensitive",
  },
  "withdrawal-rejected": {
    category: "transactions",
    channelId: ANDROID_PUSH_CHANNELS.transactions,
    screen: "activity",
    interruptionLevel: "time-sensitive",
  },
  "kyc-approved": {
    category: "identity",
    channelId: ANDROID_PUSH_CHANNELS.identity,
    screen: "kyc",
    interruptionLevel: "active",
  },
  "kyc-rejected": {
    category: "identity",
    channelId: ANDROID_PUSH_CHANNELS.identity,
    screen: "kyc",
    interruptionLevel: "time-sensitive",
  },
  "security-new-login": {
    category: "security",
    channelId: ANDROID_PUSH_CHANNELS.security,
    screen: "security",
    interruptionLevel: "time-sensitive",
  },
  "security-account-locked": {
    category: "security",
    channelId: ANDROID_PUSH_CHANNELS.security,
    screen: "security",
    interruptionLevel: "time-sensitive",
  },
  "password-changed": {
    category: "security",
    channelId: ANDROID_PUSH_CHANNELS.security,
    screen: "security",
    interruptionLevel: "time-sensitive",
  },
  "push-test": {
    category: "account",
    channelId: ANDROID_PUSH_CHANNELS.account,
    screen: "home",
    interruptionLevel: "active",
  },
};

export function isPushEventName(value: string): value is PushEventName {
  return (PUSH_EVENTS as readonly string[]).includes(value);
}

export function getPushEventMeta(event: string) {
  if (!isPushEventName(event)) return null;
  return EVENT_META[event];
}

export function normalizeNotificationPreferences(
  raw: unknown,
): NotificationPreferenceState {
  const source =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    pushEnabled: source.pushEnabled !== false,
    transactions: source.transactions !== false,
    identity: source.identity !== false,
    security: true,
    account: source.account !== false,
  };
}

export function shouldDeliverPush(
  rawPreferences: unknown,
  category: PushCategory,
): boolean {
  const prefs = normalizeNotificationPreferences(rawPreferences);
  if (category === "security") return true;
  if (!prefs.pushEnabled) return false;
  return prefs[category] !== false;
}

export interface PushCopyVars {
  firstName?: string | null;
  tenantName?: string | null;
  formattedAmount?: string | null;
  formattedBalance?: string | null;
  reference?: string | null;
  rejectionReason?: string | null;
}

export interface PushCopy {
  title: string;
  body: string;
  subtitle?: string;
}

function nameOrThere(firstName?: string | null) {
  const trimmed = firstName?.trim();
  return trimmed || "there";
}

function company(tenantName?: string | null) {
  const trimmed = tenantName?.trim();
  return trimmed || "SusuFlow";
}

export function buildPushCopy(
  event: string,
  vars: PushCopyVars = {},
): PushCopy | null {
  if (!isPushEventName(event)) return null;

  const firstName = nameOrThere(vars.firstName);
  const tenantName = company(vars.tenantName);
  const amount = vars.formattedAmount || "0.00";
  const balance = vars.formattedBalance;
  const reference = vars.reference;
  const reason = vars.rejectionReason?.trim();

  switch (event) {
    case "deposit-initiated":
      return {
        title: "Approve your deposit",
        subtitle: tenantName,
        body: `Hi ${firstName}, confirm GHS ${amount} on your phone to credit your ${tenantName} wallet.${
          reference ? ` Ref ${reference}.` : ""
        }`,
      };
    case "deposit-confirmed":
      return {
        title: "Money received",
        subtitle: tenantName,
        body: `Hi ${firstName}, GHS ${amount} is now in your ${tenantName} wallet.${
          balance ? ` Balance: GHS ${balance}.` : ""
        }${reference ? ` Ref ${reference}.` : ""}`,
      };
    case "deposit-failed":
      return {
        title: "Deposit did not go through",
        subtitle: tenantName,
        body: `Hi ${firstName}, we could not collect GHS ${amount}.${
          reason ? ` ${reason}` : " Try again or use another number."
        }${reference ? ` Ref ${reference}.` : ""}`,
      };
    case "withdrawal-requested":
      return {
        title: "Withdrawal received",
        subtitle: tenantName,
        body: `Your GHS ${amount} payout is with ${tenantName} for review.${
          reference ? ` Ref ${reference}.` : ""
        }`,
      };
    case "withdrawal-approved":
      return {
        title: "Payout on the way",
        subtitle: tenantName,
        body: `GHS ${amount} was approved and is being sent.${
          balance ? ` Balance: GHS ${balance}.` : ""
        }`,
      };
    case "withdrawal-completed":
      return {
        title: "Payout completed",
        subtitle: tenantName,
        body: `GHS ${amount} has left your wallet.${
          balance ? ` Balance: GHS ${balance}.` : ""
        }${reference ? ` Ref ${reference}.` : ""}`,
      };
    case "withdrawal-rejected":
      return {
        title: "Payout declined",
        subtitle: tenantName,
        body: `Your GHS ${amount} withdrawal was declined. Funds are back in your wallet.${
          reason ? ` ${reason}` : ""
        }`,
      };
    case "kyc-approved":
      return {
        title: "Identity verified",
        subtitle: tenantName,
        body: `Hi ${firstName}, ${tenantName} approved your identity. You can save with full access.`,
      };
    case "kyc-rejected":
      return {
        title: "Verification needs attention",
        subtitle: tenantName,
        body: `Hi ${firstName}, ${tenantName} could not verify your identity.${
          reason ? ` ${reason}` : " Please resubmit a clearer ID and selfie."
        }`,
      };
    case "security-new-login":
      return {
        title: "New sign-in",
        subtitle: tenantName,
        body: `Your ${tenantName} account was just signed in. If this was not you, change your password immediately.`,
      };
    case "security-account-locked":
      return {
        title: "Account temporarily locked",
        subtitle: tenantName,
        body: `Too many failed sign-in attempts on your ${tenantName} account. Wait a few minutes, then try again or reset your password.`,
      };
    case "password-changed":
      return {
        title: "Password updated",
        subtitle: tenantName,
        body: `Your ${tenantName} password was changed. If you did not do this, reset it now and contact your susu company.`,
      };
    case "push-test":
      return {
        title: "SusuFlow is ready",
        subtitle: tenantName,
        body: `Hi ${firstName}, alerts will reach this phone even when the app is closed — including payments, payouts, and security.`,
      };
    default:
      return null;
  }
}
