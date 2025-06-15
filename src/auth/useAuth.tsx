import React, { useState, useEffect, useContext, createContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  name: string | null;
  role: "superadmin" | "owner" | "employee" | null;
}

interface AuthContextProps {
  session: any;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Utility to map DB role to frontend role
  const mapDbRoleToUserProfileRole = (dbRole: string | null): UserProfile["role"] => {
    if (dbRole === "superadmin") return "superadmin";
    if (dbRole === "admin") return "owner";
    if (dbRole === "user") return "employee";
    return null;
  };

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, name, role")
        .eq("id", userId)
        .maybeSingle();
      if (fetchError || !data) {
        console.error("[Auth] fetchProfile error", fetchError, "data", data);
        setError("Profile not found. Please contact support.");
        setProfile(null);
        return null;
      }
      setProfile({
        id: data.id,
        name: data.name,
        role: mapDbRoleToUserProfileRole(data.role),
      });
      setError(null);
      return data;
    } catch (err) {
      setError("Failed to fetch user profile.");
      setProfile(null);
      console.error("[Auth] Exception in fetchProfile", err);
      return null;
    }
  }, []);

  // Fix: Always set loading properly and log auth state changes
  useEffect(() => {
    let mounted = true;
    const getSessionAndProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (data?.session && mounted) {
        setSession(data.session);
        await fetchProfile(data.session.user.id);
      } else {
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
      console.log("[Auth] getSessionAndProfile:", { session: data?.session, profile });
    };
    getSessionAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setSession(session);
        await fetchProfile(session.user.id);
      } else {
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
      console.log("[Auth] onAuthStateChange:", { session, profile });
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // LOGIN
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError || !data?.user) {
        setError(loginError?.message || "Invalid login credentials.");
        setLoading(false);
        return;
      }
      await fetchProfile(data.user.id); // Profile will be loaded
      setLoading(false);
    } catch (err) {
      setError("Unexpected error during login.");
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, profile, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
