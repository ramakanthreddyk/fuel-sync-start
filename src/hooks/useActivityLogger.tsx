
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
      let station_id = stationId ?? null;

      // user_activity_log is a custom table, so we use any here
      const { error } = await supabase
        .from<any, any>("user_activity_log")
        .insert([
          {
            user_id: profile.id,
            station_id,
            activity_type: activityType,
            details: details ?? null,
          },
        ]);

      if (error) {
        console.error("Activity log error:", error);
      }
    },
    [profile]
  );

  return logActivity;
}

