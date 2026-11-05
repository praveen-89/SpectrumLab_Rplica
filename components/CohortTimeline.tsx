import Link from "next/link";
import Image from "next/image";
import type { PersonWithSlug } from "@/lib/content/people";
import { alumniYear } from "@/lib/content/people";
import { EmailIcon, GoogleScholarIcon, GitHubIcon, LinkedInIcon, GlobeIcon, TwitterIcon } from "./icons";
import ObfuscatedEmail from "./ObfuscatedEmail";
import { obfuscateEmail } from "@/lib/security/obfuscate";

// "Kolavennu Mani Kanta Krishna Kumar" -> "KM" on the original (first two
// words, not first+last) — confirmed against its rendered initials for
// every photo-less alum on this page.
function initials(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return ((first?.[0] ?? "") + (second?.[0] ?? "")).toUpperCase();
}

function groupByYear(people: PersonWithSlug[]): [number, PersonWithSlug[]][] {
  const groups = new Map<number, PersonWithSlug[]>();
  for (const person of people) {
    const year = alumniYear(person);
    if (year === undefined) continue;
    const existing = groups.get(year);
    if (existing) existing.push(person);
    else groups.set(year, [person]);
  }
  return [...groups.entries()].sort((a, b) => b[0] - a[0]);
}

/**
 * The original's bespoke layout for /people/mtech-graduates/ only — a
 * vertical year-rail timeline (.cohorts/.cohort/.alum), not the flat card
 * grid every other group page uses (PeopleGrid).
 */
export default function CohortTimeline({ people }: { people: PersonWithSlug[] }) {
  return (
    <div className="cohorts">
      {groupByYear(people).map(([year, group]) => (
        <section className="cohort" key={year}>
          <div className="cohort__rail">
            <span className="cohort__year">{year}</span>
            <span className="cohort__count">
              <span className="visually-hidden">Graduates: </span>
              {group.length}
            </span>
          </div>
          <ul className="cohort__people">
            {group.map((person) => {
              const href = `/people/${person.slug.replace(/^\/+|\/+$/g, "")}/`;
              const links = person.links ?? {};
              return (
                <li className="alum" key={person.slug}>
                  <Link className="alum__face" href={href} aria-hidden="true" tabIndex={-1}>
                    {person.image ? (
                      <Image
                        src={person.image}
                        alt=""
                        width={88}
                        height={88}
                        className="alum__photo"
                        sizes="88px"
                        loading="lazy"
                      />
                    ) : (
                      <span className="alum__initials">{initials(person.name)}</span>
                    )}
                  </Link>
                  <div className="alum__identity">
                    <Link className="alum__name" href={href}>
                      {person.name}
                    </Link>
                    {person.badge && <span className="alum__badges">{person.badge}</span>}
                  </div>
                  {person.now && <p className="alum__now">{person.now}</p>}
                  <div className="alum__links">
                    {links.email && (
                      <ObfuscatedEmail
                        encoded={obfuscateEmail(links.email)}
                        title="Email"
                        aria-label="Email"
                        className="alum__link"
                      >
                        <EmailIcon size={14} />
                      </ObfuscatedEmail>
                    )}
                    {links.scholar && (
                      <a
                        href={links.scholar}
                        title="Google Scholar"
                        aria-label="Google Scholar"
                        className="alum__link"
                        target="_blank"
                        rel="external nofollow noopener"
                      >
                        <GoogleScholarIcon size={14} />
                      </a>
                    )}
                    {links.github && (
                      <a
                        href={links.github}
                        title="GitHub"
                        aria-label="GitHub"
                        className="alum__link"
                        target="_blank"
                        rel="external nofollow noopener"
                      >
                        <GitHubIcon size={14} />
                      </a>
                    )}
                    {links.linkedin && (
                      <a
                        href={links.linkedin}
                        title="LinkedIn"
                        aria-label="LinkedIn"
                        className="alum__link"
                        target="_blank"
                        rel="external nofollow noopener"
                      >
                        <LinkedInIcon size={14} />
                      </a>
                    )}
                    {links.twitter && (
                      <a
                        href={links.twitter}
                        title="Twitter"
                        aria-label="Twitter"
                        className="alum__link"
                        target="_blank"
                        rel="external nofollow noopener"
                      >
                        <TwitterIcon size={14} />
                      </a>
                    )}
                    {links.website && (
                      <a
                        href={links.website}
                        title="Personal Website"
                        aria-label="Personal Website"
                        className="alum__link"
                        target="_blank"
                        rel="external nofollow noopener"
                      >
                        <GlobeIcon size={14} />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
