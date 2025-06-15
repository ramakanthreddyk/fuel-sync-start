
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/auth/useAuth";
import ProtectedRoute from "@/auth/ProtectedRoute";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Setup from "@/pages/setup";
import Superadmin from "@/pages/superadmin";
import Owner from "@/pages/owner";
import Employee from "@/pages/employee";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route
              path="/superadmin"
              element={<ProtectedRoute requiredRole="superadmin" />}
            >
              <Route index element={<Superadmin />} />
            </Route>
            <Route
              path="/owner"
              element={<ProtectedRoute requiredRole="owner" />}
            >
              <Route index element={<Owner />} />
            </Route>
            <Route
              path="/employee"
              element={<ProtectedRoute requiredRole="employee" />}
            >
              <Route index element={<Employee />} />
            </Route>
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
