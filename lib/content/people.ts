import "server-only";
import { readCollection } from "./collection";
import { personSchema, type Person, type PersonGroup } from "./schemas";

export type PersonWithSlug = Person & { slug: string };

function normalizePersonSlug(person: PersonWithSlug): string {
  if (person.slug.startsWith("current/") || person.slug.startsWith("alumni/")) {
    return person.slug;
  }
  const isAlumni = person.group.includes("graduates") || person.group === "past-post-docs";
  return isAlumni ? `alumni/${person.group}/${person.slug}` : `current/${person.group}/${person.slug}`;
}

/** Reads every person under content/people/ (current + alumni + the director). */
export async function readPeople(): Promise<PersonWithSlug[]> {
  const people = await readCollection("people", personSchema);
  return people.map((person) => {
    const slug = normalizePersonSlug(person);
    return slug === person.slug ? person : { ...person, slug };
  });
}

/** Looks up a person by their slug (the full "current/..." or "alumni/..." path). */
export async function findPersonBySlug(slug: string): Promise<PersonWithSlug | undefined> {
  const people = await readPeople();
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return people.find((person) => person.slug === cleanSlug);
}

// A graduation/alumni year embedded in the slug ("alumni/<group>/<year>/<slug>"),
// or undefined for a current member ("current/<group>/<slug>").
export function alumniYear(person: PersonWithSlug): number | undefined {
  const segments = person.slug.split("/");
  if (segments[0] !== "alumni") return undefined;
  const year = Number(segments[2]);
  return Number.isFinite(year) ? year : undefined;
}

/**
 * People in a given group, lab director excluded (it has no list page).
 * Current members first (by name), then alumni grouped by year (newest
 * first, by name within a year) — the original's own tie-break order
 * within a year isn't derivable from the rendered page, so this is a
 * reasonable stand-in.
 */
export async function readPeopleByGroup(group: PersonGroup): Promise<PersonWithSlug[]> {
  const people = await readPeople();
  return people
    .filter((person) => person.group === group)
    .sort((a, b) => {
      const yearA = alumniYear(a);
      const yearB = alumniYear(b);
      if (yearA === undefined && yearB !== undefined) return -1;
      if (yearA !== undefined && yearB === undefined) return 1;
      if (yearA !== undefined && yearB !== undefined && yearA !== yearB) return yearB - yearA;
      return a.name.localeCompare(b.name);
    });
}
