
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'employee' | 'superadmin';
  is_active: boolean;
  created_at: string;
}

export default function StationStaffList() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the user's first station (since mapped via user_stations)
  const currentStation = user?.stations?.[0];

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      if (!currentStation) {
        setStaff([]);
        setLoading(false);
        return;
      }
      // Fetch users mapped to this station
      const { data, error } = await supabase
        .from("user_stations")
        .select("user_id, users (id, name, email, role, is_active, created_at)")
        .eq("station_id", currentStation.id);

      if (error) {
        setStaff([]);
      } else {
        setStaff(
          (data || [])
            .map((row: any) => row.users)
            .filter(Boolean)
        );
      }
      setLoading(false);
    };
    fetchStaff();
  }, [currentStation]);

  if (!currentStation) {
    return (
      <Card>
        <CardContent className="py-5">
          <p className="text-center text-muted-foreground">No station assigned for this user.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>
            Staff at <span className="text-primary">{currentStation.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground mb-4">Loading...</p>
          ) : staff.length === 0 ? (
            <p className="text-muted-foreground mb-4">No staff assigned to this station yet.</p>
          ) : (
            <div className="divide-y">
              {staff.map(staff => (
                <div key={staff.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold">{staff.name}</p>
                    <div className="text-xs text-muted-foreground">{staff.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={staff.role === "owner"
                        ? "secondary"
                        : staff.role === "employee"
                        ? "outline"
                        : "default"}
                    >
                      {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </Badge>
                    {!staff.is_active && (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
