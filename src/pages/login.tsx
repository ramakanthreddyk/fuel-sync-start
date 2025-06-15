
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/useAuth";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { login, profile, loading, error, session } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect if the profile is loaded
  useEffect(() => {
    if (profile?.role === "superadmin") navigate("/superadmin", { replace: true });
    else if (profile?.role === "owner") navigate("/owner", { replace: true });
    else if (profile?.role === "employee") navigate("/employee", { replace: true });
    else if (!loading && session && !profile) {
      // If loading ended, session exists but profile doesn't, probably profile fetch failed
      setFormError("Profile not found. Please contact support.");
    }
  }, [profile, loading, session, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.email || !form.password) {
      setFormError("Email and password are required.");
      return;
    }
    await login(form.email, form.password);
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
          {(formError || error) && (
            <div className="text-destructive text-sm">
              {formError || error}
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
