"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/Admin/frontend/admin-nav";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="admin-sidebar" aria-label="Admin sections">
      <Link href="/admin" className="admin-sidebar-brand">
        Spectrum Lab Admin
      </Link>
      <Link href="/admin" className={`admin-sidebar-overview ${pathname === "/admin" ? "active" : ""}`}>
        Dashboard
      </Link>
      {ADMIN_NAV.map((group) => (
        <div className="admin-sidebar-group" key={group.label}>
          <span className={`admin-sidebar-group-label ${group.caution ? "caution" : ""}`}>{group.label}</span>
          {group.items.map((item) => (
            <Link key={item.href} href={item.href} className={`admin-sidebar-link ${pathname === item.href ? "active" : ""}`}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
