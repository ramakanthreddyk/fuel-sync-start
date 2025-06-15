
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Setup: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check if this is the first user; if not, redirect
  useEffect(() => {
    let mounted = true;
    (async () => {
      setChecking(true);
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (!mounted) return;
      if (error) {
        setFormError("Unable to check setup status. Please try again.");
        setChecking(false);
        setLoading(false);
        return;
      }
      if ((count ?? 0) > 0) {
        navigate("/login", { replace: true });
        return;
      }
      setChecking(false);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  // Handle basic form changes
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormError(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Handle form submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.name || !form.email || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);

    // 1. Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (error || !data?.user) {
      setFormError(error?.message || "Signup failed.");
      setSubmitting(false);
      return;
    }
    const userId = data.user.id;

    // 2. Insert into profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      name: form.name,
      role: "superadmin",
    });

    if (profileError) {
      setFormError(profileError.message || "Failed to create profile.");
      setSubmitting(false);
      return;
    }

    // 3. Redirect to /superadmin
    navigate("/superadmin", { replace: true });
  }

  if (loading || checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="flex items-center">
            <CardTitle className="text-lg text-primary">Initial Superadmin Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="animate-spin w-5 h-5" />
              Checking FuelSync setup…
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md px-0 py-10">
        <CardHeader>
          <CardTitle className="text-2xl">Initial Superadmin Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label htmlFor="name" className="block mb-1 text-muted-foreground">Name</label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="off"
                value={form.name}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-muted-foreground">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1 text-muted-foreground">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
            {formError && (
              <div className="text-destructive text-sm">{formError}</div>
            )}
            <Button
              type="submit"
              className="w-full mt-4 py-2"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="animate-spin w-4 h-4" /> Setting Up…
                </span>
              ) : (
                "Create Superadmin"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
