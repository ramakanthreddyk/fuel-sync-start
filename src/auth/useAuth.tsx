
import React, { useState, useEffect, useContext, createContext } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "superadmin" | "owner" | "employee" | null;
}

interface AuthContextProps {
  session: any; // Supabase session type
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Placeholder: fetch session/profile logic to be implemented in next steps.
  useEffect(() => {
    // TODO: Add Supabase auth session sync logic here.
  }, []);

  const login = async (email: string, password: string) => {
    // Auth logic stub (to be implemented in Step 0.1)
    return null;
  };

  const logout = async () => {
    // Logout logic stub
    return;
  };

  return (
    <AuthContext.Provider value={{ session, profile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
