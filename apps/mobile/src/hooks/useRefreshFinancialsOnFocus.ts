import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { refreshCustomerFinancials } from "@/lib/financial-queries";
import type { CustomerSessionScope } from "@/lib/query-keys";

const BACKGROUND_POLL_MS = 12_000;

/**
 * Silently refetch wallet + transactions when the screen is visible.
 * Re-runs when the authenticated customer session changes (e.g. after sign-in).
 */
export function useRefreshFinancialsOnFocus(
  scope: CustomerSessionScope | null,
) {
  const queryClient = useQueryClient();
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  useEffect(() => {
    if (scope) {
      refreshCustomerFinancials(queryClient, scope);
    }
  }, [scope, queryClient]);

  useFocusEffect(
    useCallback(() => {
      const current = scopeRef.current;
      if (!current) return;

      refreshCustomerFinancials(queryClient, current);

      const interval = setInterval(() => {
        const active = scopeRef.current;
        if (active) {
          refreshCustomerFinancials(queryClient, active);
        }
      }, BACKGROUND_POLL_MS);

      return () => clearInterval(interval);
    }, [queryClient]),
  );
}
