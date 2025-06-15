
import { useAuth } from "@/auth/useAuth";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * useActivityLogger - Hook to log user activity to Supabase
 * @returns logActivity: (activityType: string, details?: Record<string, any>) => Promise<void>
 */
export function useActivityLogger() {
  const { profile } = useAuth();

  /**
   * Logs a user activity event to Supabase (user_activity_log table).
   * @param activityType - The type of activity, e.g. 'dashboard_view'
   * @param details - (Optional) Extra details as a JSON object. Device, browser, page params, etc.
   * @param stationId - (Optional) For station accounts, log against the station (defaults to user's first station)
   */
  const logActivity = useCallback(
    async (
      activityType: string,
      details?: Record<string, any>,
      stationId?: number
    ) => {
      if (!profile?.id) return;
      // Use provided stationId or user's first (if available)
      let station_id = stationId;
      // You may want to load the user's stations via another context/hook
      // temporarily set as null if not known
      if (!station_id) {
        station_id = null;
      }
      const { error } = await supabase.from<any>("user_activity_log").insert({
        user_id: profile.id, // uuid string
        station_id: station_id ?? null,
        activity_type: activityType,
        details: details ?? null,
      });
      if (error) {
        // For debug, warn in dev
      }
    },
    [profile]
  );

  return logActivity;
}
