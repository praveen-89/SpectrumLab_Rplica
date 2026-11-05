import Link from "next/link";
import type { TalkWithSlug } from "@/lib/content/talks";
import { renderMarkdown } from "@/lib/content/markdown";
import {
  CalendarIcon,
  ClockIcon,
  MapMarkerIcon,
  UserTieIcon,
  UsersIcon,
  UserFriendsIcon,
  FileAltIcon,
  UserPlusIcon,
} from "./icons";

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function badgeClass(type: string): string {
  return `talk-badge--${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
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

export default async function TalkDetail({
  talk,
  basePath,
}: {
  talk: TalkWithSlug;
  basePath: "organized" | "delivered";
}) {
  const abstractHtml = talk.body ? await renderMarkdown(talk.body) : "";

  return (
    <div className="talk-page">
      <header className="talk-header" data-aos="fade-down">
        {talk.type && <span className={`talk-badge ${badgeClass(talk.type)}`}>{talk.type}</span>}
        <h1 className="talk-title">{talk.title}</h1>
        <div className="talk-meta">
          <div className="talk-meta-item">
            <CalendarIcon size={14} />
            <span>{formatDate(talk.date)}</span>
          </div>
          {talk.time && (
            <div className="talk-meta-item">
              <ClockIcon size={14} />
              <span>{talk.time}</span>
            </div>
          )}
          {talk.venue && (
            <div className="talk-meta-item">
              <MapMarkerIcon size={14} />
              {talk.venueUrl ? (
                <a href={talk.venueUrl} target="_blank" rel="noopener noreferrer">
                  {talk.venue}
                </a>
              ) : (
                <span>{talk.venue}</span>
              )}
            </div>
          )}
        </div>
        {talk.keywords.length > 0 && (
          <div className="talk-keywords">
            {talk.keywords.map((keyword) => (
              <span className="talk-keyword" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        )}
      </header>

      {talk.speakers.length === 1 && (
        <section className="talk-section" data-aos="fade-down">
          <h2>
            <UserTieIcon size={14} />
            {talk.speakersLabel ?? "Speaker"}
          </h2>
          <div className="talk-speaker-card">
            <strong>
              <PersonLink person={talk.speakers[0]} />
            </strong>
            {talk.speakers[0].affiliation && (
              <>
                <br />
                <span className="speaker-affiliation">{talk.speakers[0].affiliation}</span>
              </>
            )}
          </div>
        </section>
      )}

      {talk.speakers.length > 1 && (
        <section className="talk-section" data-aos="fade-down">
          <h2>
            <UsersIcon size={14} />
            {talk.speakersLabel ?? "Speakers"}
          </h2>
          <ul className="talk-speakers-list">
            {talk.speakers.map((speaker) => (
              <li key={speaker.name}>
                <PersonLink person={speaker} />
                {speaker.affiliation && ` (${speaker.affiliation})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {talk.host && (
        <section className="talk-section" data-aos="fade-down">
          <h2>
            <UserFriendsIcon size={14} />
            Host
          </h2>
          <p>
            <PersonLink person={talk.host} />
          </p>
        </section>
      )}

      {abstractHtml && (
        <section className="talk-section" data-aos="fade-down">
          <h2>
            <FileAltIcon size={14} />
            {talk.abstractLabel ?? "Abstract"}
          </h2>
          <div className="talk-abstract" dangerouslySetInnerHTML={{ __html: abstractHtml }} />
        </section>
      )}

      {talk.links.url && (
        <section className="talk-section" data-aos="fade-down">
          <a href={talk.links.url} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            <UserPlusIcon size={14} /> Register
          </a>
        </section>
      )}

      {(talk.links.slides || talk.links.video) && (
        <section className="talk-section" data-aos="fade-down">
          {talk.links.slides && (
            <a href={talk.links.slides} className="btn btn-outline-primary" target="_blank" rel="noopener noreferrer">
              Slides
            </a>
          )}
          {talk.links.video && (
            <a href={talk.links.video} className="btn btn-outline-primary" target="_blank" rel="noopener noreferrer">
              Video
            </a>
          )}
        </section>
      )}

      <footer className="talk-footer" data-aos="fade-down">
        <Link href="/talks/organized/" className="btn btn-outline-primary">
          Back to Talks Organized
        </Link>
        {basePath === "delivered" && (
          <Link href="/talks/delivered/" className="btn btn-outline-primary">
            Back to Talks Delivered
          </Link>
        )}
      </footer>
    </div>
  );
}
