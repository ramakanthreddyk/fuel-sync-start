
import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="bg-card px-8 py-10 shadow-lg rounded-lg w-full max-w-md border border-border">
        <h2 className="text-2xl font-semibold mb-6 text-primary">FuelSync Login</h2>
        <form className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-1 text-muted-foreground">Email</label>
            <input
              id="email"
              type="email"
              className="w-full border border-input rounded px-3 py-2 bg-background"
              placeholder="name@company.com"
              disabled
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-muted-foreground">Password</label>
            <input
              id="password"
              type="password"
              className="w-full border border-input rounded px-3 py-2 bg-background"
              placeholder="••••••••"
              disabled
            />
          </div>
          <button
            type="submit"
            className="w-full mt-4 py-2 rounded bg-primary text-primary-foreground font-medium disabled:opacity-60"
            disabled
          >
            Sign In (Coming Soon)
          </button>
        </form>
        <div className="text-xs text-center text-muted-foreground mt-6">
          <Link to="/" className="underline">
            &larr; Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
