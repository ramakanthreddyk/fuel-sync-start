
import React from "react";
import { Link, useLocation } from "react-router-dom";

const sidebarLinks = [
  { path: "/superadmin", label: "Superadmin" },
  { path: "/owner", label: "Owner" },
  { path: "/employee", label: "Employee" },
];

const Sidebar = () => {
  const { pathname } = useLocation();
  return (
    <aside className="h-full w-56 bg-sidebar border-r border-border flex flex-col py-6 px-4">
      <div className="font-semibold text-lg mb-8 text-sidebar-foreground">Dashboard</div>
      <nav className="flex flex-col gap-3">
        {sidebarLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-3 py-2 rounded transition ${
              pathname === link.path
                ? "bg-primary text-primary-foreground font-bold"
                : "hover:bg-accent"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
