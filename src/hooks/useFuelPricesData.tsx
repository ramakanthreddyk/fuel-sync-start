
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRoleAccess } from "./useRoleAccess";

interface FuelPrice {
  id: number;
  station_id: number;
  fuel_type: 'PETROL' | 'DIESEL' | 'CNG' | 'EV';
  price_per_litre: number;
  valid_from: string;
  created_by: number;
  created_at: string;
}

export function useFuelPricesData() {
  const { currentStation, canAccessAllStations } = useRoleAccess();

  return useQuery({
    queryKey: ['fuel-prices', currentStation?.id],
    queryFn: async () => {
      if (!canAccessAllStations && !currentStation?.id) {
        return [];
      }

      let query = supabase
        .from<any, any>('fuel_prices')
        .select('*')
        .order('valid_from', { ascending: false });

      if (!canAccessAllStations && currentStation?.id) {
        query = query.eq('station_id', currentStation.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const latestPrices = new Map<string, FuelPrice>();

      (Array.isArray(data) ? data : []).forEach((price: any) => {
        if (!price?.station_id || !price?.fuel_type) return;
        const key = `${price.station_id}-${price.fuel_type}`;
        if (!latestPrices.has(key)) {
          latestPrices.set(key, price as FuelPrice);
        }
      });

      return Array.from(latestPrices.values());
    },
    enabled: canAccessAllStations || !!currentStation?.id,
  });
}
