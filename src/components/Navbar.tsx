
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => (
  <header className="w-full border-b border-border bg-background">
    <div className="px-6 py-3 flex items-center justify-between max-w-7xl mx-auto">
      <Link to="/" className="font-bold text-xl tracking-tight text-primary">FuelSync</Link>
      <nav className="flex gap-6 text-sm">
        <Link to="/login" className={cn("hover:text-primary")}>Login</Link>
        {/* <Link to="/setup" className={cn("hover:text-primary")}>Setup</Link> */}
      </nav>
    </div>
  </header>
);

export default Navbar;
