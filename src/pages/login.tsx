import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Clear error on input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    // Validate input
    if (!form.email || !form.password) {
      setFormError("Email and password are required.");
      setLoading(false);
      return;
    }

    // 1. Authenticate
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError || !signInData.user) {
      setFormError(signInError?.message || "Invalid login credentials.");
      setLoading(false);
      return;
    }

    // 2. Fetch profile
    const userId = signInData.user.id;
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profileData) {
      setFormError(profileError?.message || "Profile not found. Please contact support.");
      setLoading(false);
      return;
    }

    // 3. Route based on role
    let role = profileData.role;
    // Map backend roles to frontend ones if needed here
    if (role === "admin") role = "owner";
    else if (role === "user") role = "employee";

    if (role === "superadmin") {
      navigate("/superadmin", { replace: true });
    } else if (role === "owner") {
      navigate("/owner", { replace: true });
    } else if (role === "employee") {
      navigate("/employee", { replace: true });
    } else {
      setFormError("Unknown or missing profile role. Please contact support.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="bg-card px-8 py-10 shadow-lg rounded-lg w-full max-w-md border border-border">
        <h2 className="text-2xl font-semibold mb-6 text-primary">FuelSync Login</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block mb-1 text-muted-foreground">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              placeholder="name@company.com"
              disabled={loading}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-muted-foreground">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          {formError && (
            <div className="text-destructive text-sm">
              {formError}
            </div>
          )}
          <Button
            type="submit"
            className="w-full mt-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin w-4 h-4" /> Signing In &hellip;
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        <div className="text-xs text-center text-muted-foreground mt-6">
          <Link to="/" className="underline">&larr; Back to Landing</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
