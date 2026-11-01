import type { Metadata } from "next";
import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatCard from "@/Admin/frontend/components/StatCard";
import {
  BookIcon,
  PeopleIcon,
  DocumentIcon,
  MicrophoneIcon,
  ImageIcon,
  VideoIcon,
  PenIcon,
  AwardIcon,
  FundingIcon,
  CalendarIcon,
} from "@/Admin/frontend/components/icons";

export const metadata: Metadata = { title: "Admin Dashboard" };

const STATS: Array<{ table: string; label: string; href: string; icon: React.ReactNode }> = [
  { table: "publications", label: "Publications", href: "/admin/publications", icon: <BookIcon /> },
  { table: "people", label: "People", href: "/admin/people", icon: <PeopleIcon /> },
  { table: "news", label: "News", href: "/admin/news", icon: <DocumentIcon /> },
  { table: "talks", label: "Talks", href: "/admin/talks", icon: <MicrophoneIcon /> },
  { table: "gallery_events", label: "Gallery Photo Events", href: "/admin/gallery-events", icon: <ImageIcon /> },
  { table: "gallery_videos", label: "Gallery Videos", href: "/admin/gallery-videos", icon: <VideoIcon /> },
  { table: "articles", label: "Articles", href: "/admin/articles", icon: <PenIcon /> },
  { table: "recognition", label: "Recognition", href: "/admin/recognition", icon: <AwardIcon /> },
  { table: "grants", label: "Grants", href: "/admin/grants", icon: <FundingIcon /> },
  { table: "funders", label: "Funders", href: "/admin/funders", icon: <FundingIcon /> },
  { table: "teaching", label: "Teaching", href: "/admin/teaching", icon: <CalendarIcon /> },
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
      <h1>Welcome back</h1>
      <p className="admin-dashboard-intro">{email}</p>

      <div className="admin-stat-grid">
        {STATS.map((stat, index) => (
          <StatCard key={stat.table} icon={stat.icon} label={stat.label} count={counts[index]} href={stat.href} />
        ))}
      </div>
    </div>
  );
}
