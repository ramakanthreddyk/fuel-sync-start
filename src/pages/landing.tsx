
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Landing = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="max-w-3xl mx-auto py-24 flex flex-col items-center text-center">
      <h1 className="text-5xl font-bold mb-6 text-primary leading-snug">
        FuelSync
      </h1>
      <p className="text-lg mb-8 text-muted-foreground">
        All-in-one SaaS for smart <b>fuel station management</b>.
        <br />
        Multi-role dashboards, live analytics, effortless operations.
      </p>
      <Link
        to="/login"
        className="rounded bg-primary text-primary-foreground px-7 py-3 text-lg font-medium hover:bg-opacity-80 transition"
      >
        Get Started
      </Link>
    </section>
  </div>
);

export default Landing;
