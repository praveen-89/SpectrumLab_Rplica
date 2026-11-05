import Link from "next/link";
import type { NewsItem } from "@/lib/content/schemas";
import { renderMarkdown } from "@/lib/content/markdown";
import { ArrowRightIcon, UserTieIcon } from "./icons";

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
    items.map(async (item) => ({ item, html: item.body ? await renderMarkdown(item.body) : "" })),
  );

  return (
    <div className="news">
      <div className="news-list">
        <ul className="news-items">
          {rendered.map(({ item, html }) => {
            // A titled link — either to a /news/ detail page (detailSlug)
            // or elsewhere on the site (link) — renders as the original's
            // <a class="news-title">; anything else is prose from Markdown.
            const href = item.detailSlug ? `/news/${item.detailSlug}/` : item.link;
            return (
              <li
                className="news-item"
                key={`${item.date}-${item.detailSlug ?? item.link ?? item.title ?? item.body}`}
              >
                <div className="news-meta">
                  <span className="news-date">{formatDate(item.date)}</span>
                  {item.category && (
                    <span className={`news-badge ${badgeClass(item.category)}`}>{item.category}</span>
                  )}
                </div>
                <div className="news-body">
                  <div className="news-content">
                    {href && item.title ? (
                      <a className="news-title" href={href}>
                        {item.title}
                      </a>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: html }} />
                    )}
                  </div>
                  {item.speaker && (
                    <div className="news-speaker">
                      <UserTieIcon size={12} />
                      {item.speaker.prefix && `${item.speaker.prefix} `}
                      {item.speaker.href ? (
                        <Link href={item.speaker.href} className="coauthor-link">
                          {item.speaker.name}
                        </Link>
                      ) : (
                        item.speaker.name
                      )}
                    </div>
                  )}
                  <ArrowRightIcon className="news-arrow-icon" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
