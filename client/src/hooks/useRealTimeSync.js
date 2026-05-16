import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for real-time data syncing
 * Polls the provided API function at regular intervals and updates the state
 * @param {Function} apiFn - API function to call (should return a promise)
 * @param {Function} onDataUpdate - Callback when data is fetched
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @param {Array} dependencies - Dependencies array to re-run effect
 * @param {boolean} enabled - Enable/disable polling (default: true)
 */
export const useRealTimeSync = (
  apiFn,
  onDataUpdate,
  interval = 5000,
  dependencies = [],
  enabled = true,
) => {
  const pollingRef = useRef(null);
  const isMountedRef = useRef(true);
  const errorCountRef = useRef(0);

  const startPolling = useCallback(async () => {
    if (!enabled) return;

    // Initial fetch
    try {
      const result = await apiFn();
      if (isMountedRef.current) {
        onDataUpdate(result);
        errorCountRef.current = 0; // Reset error count on success
      }
    } catch (error) {
      if (isMountedRef.current) {
        errorCountRef.current++;
        console.error(
          `[useRealTimeSync] Initial fetch failed (attempt ${errorCountRef.current}):`,
          error,
        );
        // Log the error structure for debugging
        console.error("[useRealTimeSync] Error details:", {
          message: error.message,
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });
        // Still call onDataUpdate with error response so component can handle it
        onDataUpdate({
          data: {
            success: false,
            message:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch data",
            data: null,
          },
        });
      }
    }

    // Set up interval polling
    pollingRef.current = setInterval(async () => {
      if (!isMountedRef.current || !enabled) return;
      try {
        const result = await apiFn();
        if (isMountedRef.current) {
          onDataUpdate(result);
          // Only log success after initial error
          if (errorCountRef.current > 0) {
            console.log("[useRealTimeSync] Recovered from error");
          }
          errorCountRef.current = 0;
        }
      } catch (error) {
        errorCountRef.current++;
        if (isMountedRef.current && errorCountRef.current % 3 === 0) {
          // Log every 3rd error to avoid spam
          console.error(
            `[useRealTimeSync] Polling failed (attempt ${errorCountRef.current}):`,
            error.message,
          );
        }
        // Still call onDataUpdate with error response so component can handle it
        if (isMountedRef.current) {
          onDataUpdate({
            data: {
              success: false,
              message:
                error.response?.data?.message ||
                error.message ||
                "Failed to fetch data",
              data: null,
            },
          });
        }
      }
    }, interval);
  }, [apiFn, onDataUpdate, interval, enabled]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      const result = await apiFn();
      if (isMountedRef.current) {
        onDataUpdate(result);
      }
      return result;
    } catch (error) {
      console.error("[useRealTimeSync] Manual refetch failed:", error);
      throw error;
    }
  }, [apiFn, onDataUpdate]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling, ...dependencies]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return { refetch, stopPolling, startPolling };
};

/**
 * Hook to manage state updates triggered by events (member added, progress updated, etc.)
 */
export const useRefreshTrigger = (callback, dependencies = []) => {
  const triggerRef = useRef(0);

  const trigger = useCallback(() => {
    triggerRef.current += 1;
  }, []);

  useEffect(() => {
    callback();
  }, [triggerRef.current, ...dependencies]);

  return trigger;
};
