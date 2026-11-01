"use client";

import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/Admin/frontend/admin-nav";

const ALL_ITEMS = ADMIN_NAV.flatMap((group) => group.items);

/** Resolves the current route to a human page title for the topbar, from the same ADMIN_NAV data the sidebar uses. */
export default function AdminTopbarTitle() {
  const pathname = usePathname();

  if (pathname === "/admin") return <h1 className="admin-topbar-title">Dashboard</h1>;

  const match = ALL_ITEMS.filter((item) => pathname.startsWith(item.href)).sort((a, b) => b.href.length - a.href.length)[0];

  const suffix = pathname.endsWith("/new") ? " — New" : pathname.includes("/edit") ? " — Edit" : "";

  return <h1 className="admin-topbar-title">{(match?.label ?? "Admin") + suffix}</h1>;
}
