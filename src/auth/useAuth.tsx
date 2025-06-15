
import React, { useState, useEffect, useContext, createContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
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

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", userId)
      .single();
    if (error) {
      setError("Failed to fetch user profile.");
      setProfile(null);
      return;
    }
    setProfile(data);
    setError(null);
  }, []);

  // Session & profile sync
  useEffect(() => {
    let mounted = true;
    const getSessionAndProfile = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session && mounted) {
        setSession(data.session);
        await fetchProfile(data.session.user.id);
      } else {
        setSession(null);
        setProfile(null);
      }
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      setError(error?.message || "Invalid login credentials.");
      setLoading(false);
      return;
    }
    await fetchProfile(data.user.id);
    setLoading(false);
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

