import { useFocusEffect } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import {
  prefetchCustomerTabData,
  refreshCustomerFinancials,
} from "@/lib/financial-queries";
import type { CustomerSessionScope } from "@/lib/query-keys";

/**
 * Keeps one financial cache warm for the whole tab shell.
 * Refetches only when data is stale — never on every tap or on a timer.
 */
export function useRefreshFinancialsOnFocus(
  scope: CustomerSessionScope | null,
) {
  const queryClient = useQueryClient();
  const scopeRef = useRef(scope);
  const prefetchedRef = useRef<string | null>(null);
  scopeRef.current = scope;

  useEffect(() => {
    if (!scope) return;

    const sessionId = `${scope.userId}:${scope.customerId}`;
    if (prefetchedRef.current !== sessionId) {
      prefetchedRef.current = sessionId;
      prefetchCustomerTabData(queryClient, scope);
    }

    refreshCustomerFinancials(queryClient, scope);
  }, [scope, queryClient]);

  useFocusEffect(
    useCallback(() => {
      const current = scopeRef.current;
      if (!current) return;
      refreshCustomerFinancials(queryClient, current);
    }, [queryClient]),
  );
}
