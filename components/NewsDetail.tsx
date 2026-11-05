import Link from "next/link";
import type { NewsItem } from "@/lib/content/schemas";
import { renderMarkdown } from "@/lib/content/markdown";
import { CalendarIcon, ClockIcon, MapMarkerIcon, UsersIcon, UserFriendsIcon } from "./icons";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function badgeClass(category: string): string {
  return `event-badge--${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function PersonLink({ person }: { person: { name: string; href?: string; prefix?: string } }) {
  return (
    <>
      {person.prefix && `${person.prefix} `}
      {person.href ? (
        <Link href={person.href} className="coauthor-link">
          {person.name}
        </Link>
      ) : (
        person.name
      )}
    </>
  );
}

export default async function NewsDetail({ item }: { item: NewsItem }) {
  const contentHtml = item.body ? await renderMarkdown(item.body) : "";

  return (
    <div className="event-page">
      <header className="event-header">
        {item.category && <span className={`event-badge ${badgeClass(item.category)}`}>{item.category}</span>}
        <h1 className="event-title">{item.title}</h1>
        <div className="event-meta">
          <div className="event-meta-item">
            <CalendarIcon size={14} />
            <span>{formatDate(item.date)}</span>
          </div>
          {item.time && (
            <div className="event-meta-item">
              <ClockIcon size={14} />
              <span>{item.time}</span>
            </div>
          )}
          {item.venue && (
            <div className="event-meta-item">
              <MapMarkerIcon size={14} />
              <span>{item.venue}</span>
            </div>
          )}
        </div>
      </header>

      {item.speakers.length > 0 && (
        <section className="event-section">
          <h2>
            <UsersIcon size={14} />
            Speakers
          </h2>
          <ul className="event-speakers-list">
            {item.speakers.map((speaker) => (
              <li key={speaker.name}>
                <PersonLink person={speaker} />
                {speaker.affiliation && ` (${speaker.affiliation})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {item.host && (
        <section className="event-section">
          <h2>
            <UserFriendsIcon size={14} />
            Host
          </h2>
          <p>
            <PersonLink person={item.host} />
          </p>
        </section>
      )}

      {contentHtml && (
        <section className="event-section">
          <div className="event-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </section>
      )}
    </div>
  );
}
