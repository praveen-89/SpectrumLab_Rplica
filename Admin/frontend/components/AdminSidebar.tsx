"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/Admin/frontend/admin-nav";

export default function AdminSidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className={`admin-sidebar ${open ? "open" : ""}`} aria-label="Admin sections">
      <button type="button" className="admin-sidebar-close" aria-label="Close menu" onClick={onClose}>
        ✕
      </button>
      <Link href="/admin" className="admin-sidebar-brand" onClick={onClose}>
        Spectrum Lab Admin
      </Link>
      <Link href="/admin" className={`admin-sidebar-overview ${pathname === "/admin" ? "active" : ""}`} onClick={onClose}>
        Dashboard
      </Link>
      {ADMIN_NAV.map((group) => (
        <div className="admin-sidebar-group" key={group.label}>
          <span className={`admin-sidebar-group-label ${group.caution ? "caution" : ""}`}>{group.label}</span>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar-link ${pathname.startsWith(item.href) ? "active" : ""}`}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
