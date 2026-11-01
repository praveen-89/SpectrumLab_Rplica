import Link from "next/link";

export default function StatCard({
  icon,
  label,
  count,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  href: string;
}) {
  return (
    <Link href={href} className="admin-stat-card">
      <span className="admin-stat-icon">{icon}</span>
      <span className="admin-stat-body">
        <span className="admin-stat-count">{count}</span>
        <br />
        <span className="admin-stat-label">{label}</span>
        <br />
        <span className="admin-stat-link">Manage →</span>
      </span>
    </Link>
  );
}
