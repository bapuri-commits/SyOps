import { useState, useEffect, useCallback, useRef } from "react";
import type { ServiceHealth, ServiceStatus } from "../types";

const POLL_INTERVAL_MS = 30_000;

export function useServiceHealth(serviceIds: string[]) {
  const [healthMap, setHealthMap] = useState<Record<string, ServiceHealth>>(() =>
    Object.fromEntries(
      serviceIds.map((id) => [id, { id, status: "unknown" as ServiceStatus }])
    )
  );

  const abortRef = useRef<AbortController | null>(null);

  const fetchHealth = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/health", { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ServiceHealth[] = await res.json();
      setHealthMap((prev) => {
        const next = { ...prev };
        for (const h of data) next[h.id] = h;
        return next;
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(fetchHealth, POLL_INTERVAL_MS);
    return () => {
      clearInterval(timer);
      abortRef.current?.abort();
    };
  }, [fetchHealth]);

  return healthMap;
}
