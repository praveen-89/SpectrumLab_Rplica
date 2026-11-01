import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_NAV } from "@/Admin/frontend/admin-nav";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p className="admin-dashboard-intro">Manage every piece of content on the Spectrum Lab site from here.</p>

      {ADMIN_NAV.map((group) => (
        <section key={group.label} className="admin-dashboard-group">
          <h2>{group.label}</h2>
          <div className="admin-card-grid">
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} className={`admin-card ${group.caution ? "caution" : ""}`}>
                <span className="admin-card-title">{item.label}</span>
                <span className="admin-card-description">{item.description}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
