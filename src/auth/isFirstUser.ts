
import { supabase } from "@/integrations/supabase/client";

/**
 * Helper to determine if this is the first user (no profiles).
 */
export async function isFirstUser(): Promise<boolean> {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  if (error) {
    throw error;
  }
  return (count ?? 0) === 0;
}
