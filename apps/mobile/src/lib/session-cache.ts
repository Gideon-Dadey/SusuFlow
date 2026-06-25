import { queryClient } from "@/lib/query-client";
import { useNotificationStore } from "@/stores/notification.store";

/** Wipe in-memory user data when the authenticated session changes. */
export function resetUserSessionCache() {
  queryClient.clear();
  useNotificationStore.getState().reset();
}
