import Link from "next/link";
import type { TalkWithSlug } from "@/lib/content/talks";
import { ArrowRightIcon, MapMarkerIcon, UserFriendsIcon, UserTieIcon } from "./icons";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function badgeClass(type: string): string {
  return `talk-type-badge--${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

// The original truncates the card's venue text to 37 characters (then
// appends "…") rather than relying on CSS text-overflow.
function truncateVenue(venue: string): string {
  return venue.length > 37 ? `${venue.slice(0, 37)}...` : venue;
}

function groupByYear(talks: TalkWithSlug[]): [string, TalkWithSlug[]][] {
  const years = new Map<string, TalkWithSlug[]>();
  for (const talk of talks) {
    const year = talk.date.slice(0, 4);
    const existing = years.get(year);
    if (existing) existing.push(talk);
    else years.set(year, [talk]);
  }
  return [...years.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default function TalksList({ talks, basePath }: { talks: TalkWithSlug[]; basePath: "organized" | "delivered" }) {
  return (
    <div className="talks-list-page">
      {groupByYear(talks).map(([year, items]) => (
        <section className="talks-year-section" key={year}>
          <h2 className="year-header">{year}</h2>
          <div className="talks-grid">
            {items.map((talk) => (
              <article className="talk-card" key={talk.slug}>
                <div className="talk-card-header">
                  {talk.type && <span className={`talk-type-badge ${badgeClass(talk.type)}`}>{talk.type}</span>}
                  <time className="talk-date">{formatDate(talk.date)}</time>
                </div>
                <h3 className="talk-card-title">
                  <Link href={`/talks/${basePath}/${talk.slug}/`}>{talk.title}</Link>
                </h3>
                {talk.speakers.length === 1 ? (
                  <div className="talk-speaker">
                    <UserTieIcon size={14} />
                    <span>
                      {talk.speakers[0].prefix && `${talk.speakers[0].prefix} `}
                      {talk.speakers[0].href ? (
                        talk.speakers[0].href.startsWith("/") ? (
                          <Link href={talk.speakers[0].href}>{talk.speakers[0].name}</Link>
                        ) : (
                          <a href={talk.speakers[0].href}>{talk.speakers[0].name}</a>
                        )
                      ) : (
                        talk.speakers[0].name
                      )}
                    </span>
                    {talk.speakers[0].affiliation && (
                      <span className="speaker-affiliation">{talk.speakers[0].affiliation}</span>
                    )}
                  </div>
                ) : (
                  talk.host && (
                    <div className="talk-host">
                      <UserFriendsIcon size={14} />
                      <span>
                        Host: {talk.host.prefix && `${talk.host.prefix} `}
                        {talk.host.href ? (
                          talk.host.href.startsWith("/") ? (
                            <Link href={talk.host.href}>{talk.host.name}</Link>
                          ) : (
                            <a href={talk.host.href}>{talk.host.name}</a>
                          )
                        ) : (
                          talk.host.name
                        )}
                      </span>
                    </div>
                  )
                )}
                {talk.keywords.length > 0 && (
                  <div className="talk-keywords">
                    {talk.keywords.map((keyword) => (
                      <span className="keyword-tag" key={keyword}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                {talk.venue && (
                  <div className="talk-card-footer">
                    <span className="talk-venue">
                      <MapMarkerIcon size={12} />
                      {talk.venueUrl ? (
                        <a href={talk.venueUrl} target="_blank" rel="noopener noreferrer">
                          {truncateVenue(talk.venue)}
                        </a>
                      ) : (
                        truncateVenue(talk.venue)
                      )}
                    </span>
                    <ArrowRightIcon size={14} className="talk-arrow-icon" />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
