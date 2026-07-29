"use client";

import { useEffect } from "react";

export function PwaAutoUpdater() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let refreshing = false;

    // Reload page when new service worker takes control
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Check for SW updates every 60 seconds
        const updateInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 1000);

        // Check for updates when user returns to app/tab
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            registration.update().catch(() => {});
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // When a new SW is installing, activate it immediately
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });

        return () => {
          clearInterval(updateInterval);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
        };
      })
      .catch((err) => {
        console.error("SW Registration error:", err);
      });
  }, []);

  return null;
}
