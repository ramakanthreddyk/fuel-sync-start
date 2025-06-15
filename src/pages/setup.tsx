
import React from "react";
import { Link } from "react-router-dom";

const Setup = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="bg-card px-8 py-10 shadow-lg rounded-lg w-full max-w-md border border-border">
        <h2 className="text-2xl font-semibold mb-6 text-primary">Initial Superadmin Setup</h2>
        <p className="mb-4 text-muted-foreground">
          If you are launching FuelSync for the first time,<br /> create your Superadmin account here. (Stub page)
        </p>
        <button
          className="w-full py-2 rounded bg-primary text-primary-foreground font-medium disabled:opacity-60"
          disabled
        >
          Setup (Coming Soon)
        </button>
        <div className="text-xs text-center text-muted-foreground mt-6">
          <Link to="/" className="underline">
            &larr; Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Setup;
