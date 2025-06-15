
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/auth/useAuth';
import { RequireRole } from '@/components/RequireRole';
// Removed invalid SuperAdminLayout import
import { 
  UsersPage, 
  StationsPage, 
  PumpsPage, 
  PlansPage, 
  AnalyticsPage, 
  CreateOwnerWizard 
} from '@/pages/SuperAdmin';
import Login from '@/pages/login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import AdminUsers from '@/pages/AdminUsers';
import AdminStations from '@/pages/AdminStations';
import DataEntry from '@/pages/DataEntry';
import Sales from '@/pages/Sales';
import DailyClosure from '@/pages/DailyClosure';
import Pumps from '@/pages/Pumps';
import Prices from '@/pages/Prices';
import Reports from '@/pages/Reports';
import AppLayout from '@/components/AppLayout';
import { supabase } from "@/integrations/supabase/client";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (profile) {
    // Role-based redirect after login
    if (profile.role === 'superadmin') {
      return <Navigate to="/superadmin/users" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function RoleBasedRedirect() {
  const { profile } = useAuth();
  
  if (profile?.role === 'superadmin') {
    return <Navigate to="/superadmin/users" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function useStationsForSuperAdmin() {
  return useQuery({
    queryKey: ["all-stations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stations").select("id, name, brand");
      if (error) throw error;
      return data || [];
    }
  });
}

export function AppWithQueries() {
  const stationsQuery = useStationsForSuperAdmin();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          
          {/* Super Admin Routes */}
          <Route 
            path="/superadmin/*" 
            element={
              <ProtectedRoute>
                <RequireRole role="superadmin">
                  {/* insert superadmin layout if available */}
                  <Routes>
                    <Route
                      path="/users"
                      element={
                        stationsQuery.isLoading
                          ? (
                              <div className="flex items-center justify-center min-h-screen">Loading stations…</div>
                            )
                          : (
                              <UsersPage stations={stationsQuery.data || []} />
                            )
                      }
                    />
                    <Route path="/stations" element={<StationsPage />} />
                    <Route path="/pumps" element={<PumpsPage />} />
                    <Route path="/plans" element={<PlansPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/create-owner" element={<CreateOwnerWizard />} />
                    <Route path="/" element={<Navigate to="/superadmin/users" replace />} />
                  </Routes>
                </RequireRole>
              </ProtectedRoute>
            } 
          />
          
          {/* Regular App Routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/data-entry" element={<DataEntry />} />
                    <Route path="/sales" element={<Sales />} />
                    <Route path="/daily-closure" element={<DailyClosure />} />
                    <Route path="/pumps" element={<Pumps />} />
                    <Route path="/prices" element={<Prices />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/stations" element={<AdminStations />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/upload" element={<DataEntry />} />
                    <Route path="/" element={<RoleBasedRedirect />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}
