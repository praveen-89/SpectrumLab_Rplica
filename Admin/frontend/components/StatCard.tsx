import Link from "next/link";

export default function StatCard({
  icon,
  label,
  count,
  href,
  group,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
  group: string;
}) {
  return (
    <Link href={href} className="admin-glass-card hoverable admin-stat-card">
      <div className="admin-stat-card-top">
        <span className="admin-badge admin-badge-blue">{group}</span>
        <span className="admin-stat-icon">{icon}</span>
      </div>
      <span className="admin-stat-count">{count}</span>
      <span className="admin-stat-label">{label}</span>
      <span className="admin-stat-link">Manage →</span>
    </Link>
  );
}
