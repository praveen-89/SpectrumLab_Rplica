import type { NewsItem } from "@/lib/content/schemas";
import { renderMarkdown } from "@/lib/content/markdown";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function badgeClass(category: string): string {
  return `news-badge--${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export default async function NewsList({ items }: { items: NewsItem[] }) {
  const rendered = await Promise.all(
    items.map(async (item) => ({ item, html: await renderMarkdown(item.body) })),
  );

  return (
    <div className="news">
      <div className="news-list">
        <ul className="news-items">
          {rendered.map(({ item, html }) => (
            <li className="news-item" key={`${item.date}-${item.slug ?? item.title ?? item.body}`}>
              <div className="news-meta">
                <span className="news-date">{formatDate(item.date)}</span>
                {item.category && (
                  <span className={`news-badge ${badgeClass(item.category)}`}>{item.category}</span>
                )}
              </div>
              <div className="news-body">
                <div className="news-content" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
