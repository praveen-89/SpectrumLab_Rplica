"use client";

import { useEffect, useMemo, useState } from "react";
import PublicationEntry from "./PublicationEntry";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import {
  TYPE_OPTIONS,
  getAvailableYears,
  groupByYear,
  filterByType,
  type PublicationType,
  type PublicationView,
} from "@/lib/publications-view";

export default function PublicationsBrowser({ items }: { items: PublicationView[] }) {
  // Newest-first, matching the original's hardcoded array and its
  // currentIndex=0-is-newest convention (Previous increments the index
  // towards older years, Next decrements it towards newer ones).
  const years = useMemo(() => getAvailableYears(items.map((item) => item.publication)), [items]);
  const byYear = useMemo(() => groupByYear(items, (item) => item.publication), [items]);

  const [yearIndex, setYearIndex] = useState(0);
  const [type, setType] = useState<PublicationType>("");

  // Deep link: /publications/#<citekey> switches to that entry's year,
  // clears the type filter so it's not hidden, and scrolls to it. The
  // original's own hash handling is bibsearch.js's text-search box
  // (hijacking the hash as a search query instead) — a real entry-anchor
  // like this never actually worked there; reproducing the working,
  // clearly-intended version per CLAUDE.md's fidelity-vs-bugs rule.
  // Also re-runs on "hashchange" (not just mount): a same-page hash edit —
  // clicking another #citekey link, back/forward, or the address bar —
  // doesn't reload the page, so the effect alone would only ever catch the
  // hash present on first load.
  useEffect(() => {
    function goToHash() {
      const key = decodeURIComponent(window.location.hash.slice(1));
      if (!key) return;
      const target = items.find((item) => item.publication.key === key);
      if (!target) return;

      const index = years.indexOf(target.publication.year);
      if (index >= 0) setYearIndex(index);
      setType("");

      requestAnimationFrame(() => {
        document.getElementById(key)?.scrollIntoView({ block: "start" });
      });
    }

    goToHash();
    window.addEventListener("hashchange", goToHash);
    return () => window.removeEventListener("hashchange", goToHash);
  }, [items, years]);

  const currentYear = years[yearIndex] as number | undefined;
  const currentYearItems = useMemo(
    () => filterByType(byYear.get(currentYear ?? -1) ?? [], type, (item) => item.publication),
    [byYear, currentYear, type],
  );

  return (
    <>
      <div className="pub-controls-row">
        <div className="type-filter">
          <select
            id="pub-type-filter"
            aria-label="Filter publications by type"
            value={type}
            onChange={(event) => setType(event.target.value as PublicationType)}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="year-pagination">
          <button
            id="prev-year"
            type="button"
            className="year-btn"
            disabled={yearIndex === years.length - 1}
            onClick={() => setYearIndex((index) => index + 1)}
          >
            <ChevronLeftIcon size={14} /> Previous
          </button>
          <span id="current-year-display">{currentYear}</span>
          <button
            id="next-year"
            type="button"
            className="year-btn"
            disabled={yearIndex === 0}
            onClick={() => setYearIndex((index) => index - 1)}
          >
            Next <ChevronRightIcon size={14} />
          </button>
        </div>
      </div>

      <div className="publications">
        <h2 className="bibliography">{currentYear}</h2>
        <ol className="bibliography">
          {currentYearItems.map(({ publication, authors, abstractHtml }) => (
            <PublicationEntry
              key={publication.key}
              entryKey={publication.key}
              abbr={publication.abbr}
              title={publication.title}
              authors={authors}
              venue={publication.venue}
              year={publication.year}
              month={publication.month}
              doi={publication.doi}
              url={publication.url}
              code={publication.code}
              articlePage={publication.articlePage}
              pdf={publication.pdf}
              abstractHtml={abstractHtml}
              bibtex={publication.bibtex}
            />
          ))}
        </ol>
      </div>
    </>
  );
}
