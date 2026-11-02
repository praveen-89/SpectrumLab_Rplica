import type { Metadata } from "next";
import Link from "next/link";
import {
  IconBook2,
  IconUsers,
  IconNews,
  IconMicrophone,
  IconPhoto,
  IconVideo,
  IconArticle,
  IconAward,
  IconMoneybag,
  IconBuildingBank,
  IconChalkboard,
} from "@tabler/icons-react";
import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatCard from "@/Admin/frontend/components/StatCard";

export const metadata: Metadata = { title: "Admin Dashboard" };

const STATS: Array<{ table: string; label: string; href: string; group: string; icon: React.ReactNode }> = [
  { table: "publications", label: "Publications", href: "/admin/publications", group: "Publications & People", icon: <IconBook2 size={16} /> },
  { table: "people", label: "People", href: "/admin/people", group: "Publications & People", icon: <IconUsers size={16} /> },
  { table: "news", label: "News", href: "/admin/news", group: "Content", icon: <IconNews size={16} /> },
  { table: "talks", label: "Talks", href: "/admin/talks", group: "Content", icon: <IconMicrophone size={16} /> },
  { table: "articles", label: "Articles", href: "/admin/articles", group: "Content", icon: <IconArticle size={16} /> },
  { table: "teaching", label: "Teaching", href: "/admin/teaching", group: "Content", icon: <IconChalkboard size={16} /> },
  { table: "gallery_events", label: "Gallery Photo Events", href: "/admin/gallery-events", group: "Media", icon: <IconPhoto size={16} /> },
  { table: "gallery_videos", label: "Gallery Videos", href: "/admin/gallery-videos", group: "Media", icon: <IconVideo size={16} /> },
  { table: "recognition", label: "Recognition", href: "/admin/recognition", group: "Recognition & Funding", icon: <IconAward size={16} /> },
  { table: "grants", label: "Grants", href: "/admin/grants", group: "Recognition & Funding", icon: <IconMoneybag size={16} /> },
  { table: "funders", label: "Funders", href: "/admin/funders", group: "Recognition & Funding", icon: <IconBuildingBank size={16} /> },
];

const QUICK_ACTIONS = [
  { label: "Add Person", href: "/admin/people/new" },
  { label: "Add Publication", href: "/admin/publications/new" },
  { label: "Add News", href: "/admin/news/new" },
  { label: "Add Talk", href: "/admin/talks/new" },
  { label: "Upload Photo", href: "/admin/gallery-events/new" },
];

export default async function AdminDashboardPage() {
  const { email } = await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const counts = await Promise.all(
    STATS.map(async (stat) => {
      const { count } = await supabase.from(stat.table).select("*", { count: "exact", head: true });
      return count ?? 0;
    }),
  );

  return (
    <div>
      <div className="admin-dashboard-decoration" aria-hidden="true" />
      <div className="admin-dashboard-content">
        <h1 className="anim-fade-up">Welcome back</h1>
        <p className="admin-dashboard-intro anim-fade-up">{email}</p>

        <nav className="admin-quick-actions anim-fade-up" aria-label="Quick actions">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href} className="admin-btn admin-btn-ghost admin-btn-sm">
              {action.label}
            </Link>
          ))}
        </nav>

        <div className="admin-stat-grid anim-stagger">
          {STATS.map((stat, index) => (
            <StatCard key={stat.table} icon={stat.icon} label={stat.label} count={counts[index]} href={stat.href} group={stat.group} />
          ))}
        </div>
      </div>
    </div>
  );
}
