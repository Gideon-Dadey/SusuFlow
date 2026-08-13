export type CustomerSessionScope = {
  userId: string;
  customerId: string;
};

export const queryKeys = {
  userProfile: (userId: string) => ["user-profile", userId] as const,
  wallet: (userId: string, customerId: string) =>
    ["wallet", userId, customerId] as const,
  deposits: (userId: string, customerId: string) =>
    ["deposits", userId, customerId] as const,
  withdrawals: (userId: string, customerId: string) =>
    ["withdrawals", userId, customerId] as const,
  notificationFeed: (userId: string, customerId: string) =>
    ["notification-feed", userId, customerId] as const,
  notificationInbox: (userId: string) =>
    ["notification-inbox", userId] as const,
  notificationPreferences: (userId: string) =>
    ["notification-preferences", userId] as const,
  enrollments: (userId: string) => ["my-enrollments", userId] as const,
  plans: ["plans"] as const,
  passbook: (userId: string, customerId: string) =>
    ["passbook", userId, customerId] as const,
  kycStatus: (userId: string) => ["kyc-status", userId] as const,
  tenantBranding: (slug: string) => ["tenant-branding", slug] as const,
};
