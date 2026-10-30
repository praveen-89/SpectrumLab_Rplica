import type { PersonWithSlug } from "@/lib/content/people";
import PersonCard from "./PersonCard";

function alumniYear(person: PersonWithSlug): number | undefined {
  const segments = person.slug.split("/");
  if (segments[0] !== "alumni") return undefined;
  const year = Number(segments[2]);
  return Number.isFinite(year) ? year : undefined;
}

function groupByYear(people: PersonWithSlug[]): [string, PersonWithSlug[]][] {
  const groups = new Map<string, PersonWithSlug[]>();
  for (const person of people) {
    const year = alumniYear(person);
    const key = year === undefined ? "Current" : String(year);
    const existing = groups.get(key);
    if (existing) existing.push(person);
    else groups.set(key, [person]);
  }
  return [...groups.entries()];
}

/**
 * The original shows a flat card grid for every group except mtech-graduates
 * (its ~90 people get a bespoke "cohort" timeline with year rails instead).
 * Reproducing that one bespoke layout wasn't worth a second component system
 * for a single group — year-grouped headings over the same card grid used
 * everywhere else gets the same browsability with one layout to maintain.
 */
export default function PeopleGrid({ people, groupByYear: shouldGroup }: { people: PersonWithSlug[]; groupByYear?: boolean }) {
  if (!shouldGroup) {
    return (
      <div className="grid">
        {people.map((person) => (
          <PersonCard key={person.slug} person={person} />
        ))}
      </div>
    );
  }

  return (
    <>
      {groupByYear(people).map(([year, group]) => (
        <section key={year} className="people-year-section">
          <h2 className="year-header">{year}</h2>
          <div className="grid">
            {group.map((person) => (
              <PersonCard key={person.slug} person={person} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
