
import React from "react";
import Layout from "@/components/Layout";

const Superadmin = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-2 text-primary">Superadmin Dashboard</h1>
        <div className="text-muted-foreground mb-6">
          (Stub) Welcome! Manage all stations, owners, employees.
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-secondary rounded-lg p-6 shadow border border-border">
            <div className="font-semibold text-lg mb-2">Station Overview</div>
            <div className="text-sm text-muted-foreground">[Stats coming soon]</div>
          </div>
          <div className="bg-secondary rounded-lg p-6 shadow border border-border">
            <div className="font-semibold text-lg mb-2">Owners</div>
            <div className="text-sm text-muted-foreground">[List coming soon]</div>
          </div>
          <div className="bg-secondary rounded-lg p-6 shadow border border-border">
            <div className="font-semibold text-lg mb-2">Employees</div>
            <div className="text-sm text-muted-foreground">[List coming soon]</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Superadmin;
