
import { useAuth } from '@/auth/useAuth';
import { useMemo } from 'react';

export interface StationAccess {
  id: number;
  name: string;
  brand: string;
  address: string;
}

export interface RoleAccess {
  role: 'superadmin' | 'owner' | 'employee';
  canAccessAllStations: boolean;
  stations: StationAccess[];
  currentStation: StationAccess | null;
  isAdmin: boolean;
  isOwner: boolean;
  isEmployee: boolean;
}

export function useRoleAccess(): RoleAccess {
  const { profile } = useAuth();

  return useMemo(() => {
    if (!profile) {
      return {
        role: 'employee',
        canAccessAllStations: false,
        stations: [],
        currentStation: null,
        isAdmin: false,
        isOwner: false,
        isEmployee: true,
      };
    }

    // You may want to map real stations from another hook/service
    const role = profile.role;
    const stations: StationAccess[] = []; // TODO: integrate with stations table if needed

    return {
      role: role ?? 'employee',
      canAccessAllStations: role === 'superadmin',
      stations,
      currentStation: stations[0] || null,
      isAdmin: role === 'superadmin',
      isOwner: role === 'owner',
      isEmployee: role === 'employee',
    };
  }, [profile]);
}
