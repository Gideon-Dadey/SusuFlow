/**
 * Product analytics — first-party API + optional PostHog + Sentry breadcrumbs.
 */
import { getApiBaseUrl } from "./config";
import { monitoring } from "./monitoring";
import { rememberedAccessToken, rememberedTenantSlug } from "./session-memory";
import { storage } from "./storage";

export { AnalyticsEvents } from "./analytics-events";

type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;

let distinctId: string | null = null;
let posthogKey: string | null = null;
let initialized = false;

function apiRoot(): string {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  return base.endsWith("/api/v1") ? base : `${base}/api/v1`;
}

async function postFirstParty(event: string, props?: AnalyticsProps) {
  const token = rememberedAccessToken();
  if (!token) return;
  try {
    await fetch(`${apiRoot()}/analytics/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(rememberedTenantSlug()
          ? { "x-tenant-slug": rememberedTenantSlug() }
          : {}),
      },
      body: JSON.stringify({ event, properties: props ?? {} }),
    });
  } catch {
    // Analytics must never break money flows.
  }
}

async function postPostHog(event: string, props?: AnalyticsProps) {
  if (!posthogKey || !distinctId) return;
  try {
    await fetch("https://us.i.posthog.com/capture/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: posthogKey,
        event,
        distinct_id: distinctId,
        properties: {
          ...props,
          app: "susuflow-mobile",
          $lib: "susuflow-custom",
        },
      }),
    });
  } catch {
    // ignore
  }
}

export const analytics = {
  init() {
    if (initialized) return;
    posthogKey = process.env.EXPO_PUBLIC_ANALYTICS_KEY?.trim() || null;
    initialized = true;
    if (__DEV__) {
      console.info(
        "[analytics] ready",
        posthogKey ? "(PostHog key set)" : "(first-party + Sentry only)",
      );
    }
  },

  track(event: string, props?: AnalyticsProps) {
    if (__DEV__) {
      console.info("[analytics]", event, props ?? {});
    }
    monitoring.captureMessage(`analytics:${event}`, {
      ...(props ?? {}),
      kind: "analytics",
    });
    void postFirstParty(event, props);
    void postPostHog(event, props);
  },

  identify(userId: string, traits?: AnalyticsProps) {
    distinctId = userId;
    if (__DEV__) {
      console.info("[analytics] identify", userId, traits ?? {});
    }
    void storage.setItem("analytics_distinct_id", userId);
    const email =
      typeof traits?.email === "string" && traits.email.trim()
        ? traits.email.trim()
        : undefined;
    monitoring.setUser({ id: userId, email });
  },

  reset() {
    distinctId = null;
    void storage.removeItem("analytics_distinct_id");
    monitoring.setUser(null);
    if (__DEV__) {
      console.info("[analytics] reset");
    }
  },
};
