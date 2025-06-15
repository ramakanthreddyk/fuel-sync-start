
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  requiredRole?: "superadmin" | "owner" | "employee";
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    // Loading spinner or placeholder
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span className="text-muted-foreground text-lg">Checking permissions…</span>
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to role-appropriate dashboard
    if (profile?.role === "superadmin") return <Navigate to="/superadmin" replace />;
    if (profile?.role === "owner") return <Navigate to="/owner" replace />;
    if (profile?.role === "employee") return <Navigate to="/employee" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
