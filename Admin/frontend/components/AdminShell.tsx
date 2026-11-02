"use client";

import { useEffect, useState } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbarTitle from "./AdminTopbarTitle";
import AdminThemeToggle from "./AdminThemeToggle";

/** Client wrapper owning the mobile sidebar-open state — the layout itself stays a Server Component for the auth check. */
export default function AdminShell({
  email,
  signOutAction,
  children,
}: {
  email: string;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="admin-app">
      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button type="button" className="admin-menu-toggle" aria-label="Toggle menu" onClick={() => setSidebarOpen(true)}>
              <IconMenu2 size={18} />
            </button>
            <AdminTopbarTitle />
          </div>
          <div className="admin-topbar-right">
            <AdminThemeToggle />
            <span className="admin-topbar-user">{email}</span>
            <form action={signOutAction}>
              <button type="submit" className="admin-signout-button">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <div className="admin-content">{children}</div>
        <footer className="admin-footer">Spectrum Lab Admin · Built with Next.js · © 2024 IISc</footer>
      </div>
    </div>
  );
}
