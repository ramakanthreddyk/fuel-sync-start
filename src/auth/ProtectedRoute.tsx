
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  requiredRole?: "superadmin" | "owner" | "employee";
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { session, profile } = useAuth();

  // Placeholder logic, roles/redirects to be implemented later
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && profile?.role !== requiredRole) {
    // Send users to respective dashboards
    if (profile?.role === "superadmin") return <Navigate to="/superadmin" replace />;
    if (profile?.role === "owner") return <Navigate to="/owner" replace />;
    if (profile?.role === "employee") return <Navigate to="/employee" replace />;
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
