
import { useQuery } from "@tanstack/react-query";

/**
 * useIsPremiumStation
 * Returns true if the given stationId is premium (has OCR access)
 */
export function useIsPremiumStation(stationId?: number) {
  return useQuery({
    queryKey: ["plan-limits", stationId],
    queryFn: async () => {
      if (!stationId) return false;
      // Temporarily always return false, since planLimitsService is missing.
      return false;
    },
    enabled: !!stationId,
  });
}
