// Pure, React-free helpers for the Publications page's type filter and
// year navigation (components/PublicationsBrowser.tsx), kept separate so
// the filtering/grouping logic is easy to read and test on its own.

import type { Publication } from "./content/schemas";

export type PublicationAuthorView = {
  name: string;
  href?: string;
  italic?: boolean;
};

export type PublicationView = {
  publication: Publication;
  authors: PublicationAuthorView[];
  abstractHtml?: string;
};

export const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "article", label: "Journal Articles" },
  { value: "inproceedings", label: "Conference Papers" },
  { value: "incollection", label: "Book Chapters" },
  { value: "misc", label: "Preprints & Other" },
] as const;

export type PublicationType = (typeof TYPE_OPTIONS)[number]["value"];

/** Distinct years present in the data, newest first — the original hardcodes this list (2009-2026); deriving it keeps new years working automatically. */
export function getAvailableYears(publications: Publication[]): number[] {
  return Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a);
}

/** Groups items by publication year. Takes a key-extractor so it works for both raw Publications and the {publication, ...} wrapper the page uses. */
export function groupByYear<T>(items: T[], getPublication: (item: T) => Publication): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const item of items) {
    const year = getPublication(item).year;
    const existing = map.get(year);
    if (existing) existing.push(item);
    else map.set(year, [item]);
  }
  return map;
}

/** Filters to a single BibTeX type; empty string (the "All Types" option) passes everything through. */
export function filterByType<T>(
  items: T[],
  type: PublicationType,
  getPublication: (item: T) => Publication,
): T[] {
  if (!type) return items;
  return items.filter((item) => getPublication(item).type === type);
}
