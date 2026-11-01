const COLOR_MAP: Record<string, string> = {
  current: "green",
  alumni: "gray",
  article: "blue",
  inproceedings: "orange",
  incollection: "orange",
  misc: "gray",
  organized: "blue",
  delivered: "green",
  announcement: "blue",
  award: "orange",
  paper: "green",
  talk: "orange",
};

/** Small rounded-pill badge. `color` overrides the type→color lookup in COLOR_MAP. */
export default function AdminBadge({ children, color }: { children: React.ReactNode; color?: string }) {
  const resolved = color ?? COLOR_MAP[String(children).toLowerCase()] ?? "gray";
  return <span className={`admin-badge admin-badge-${resolved}`}>{children}</span>;
}
