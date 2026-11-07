"use client";

import { useEffect, useMemo, useState } from "react";
import PublicationEntry from "./PublicationEntry";
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "./icons";
import {
  TYPE_OPTIONS,
  getAvailableYears,
  groupByYear,
  filterByType,
  matchesQuery,
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
  const [query, setQuery] = useState("");
  const isSearching = query.trim().length > 0;

  // Deep link: /publications/#<citekey> switches to that entry's year,
  // clears the type filter so it's not hidden, and scrolls to it. The
  // original's own hash handling is bibsearch.js's text-search box
  // (hijacking the hash as a search query instead) — a real entry-anchor
  // like this never actually worked there; reproducing the working,
  // clearly-intended version instead.
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

  // Searching shows matches across every year at once (no pagination),
  // same as the original: typing clears the current year's isolation so
  // bibsearch.js can filter globally.
  const searchResultsByYear = useMemo(() => {
    if (!isSearching) return [];
    const matched = items.filter((item) => matchesQuery(item, query));
    const typeFiltered = filterByType(matched, type, (item) => item.publication);
    const grouped = groupByYear(typeFiltered, (item) => item.publication);
    return years.filter((year) => grouped.has(year)).map((year) => [year, grouped.get(year)!] as const);
  }, [isSearching, items, query, type, years]);

  return (
    <>
      <div className="pub-controls-row" data-aos="fade-down">
        <div className="search-wrapper">
          <SearchIcon size={14} className="search-icon" />
          <input
            type="text"
            id="bibsearch"
            spellCheck={false}
            autoComplete="off"
            className="search bibsearch-form-input"
            placeholder="Type to filter publications..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

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

        {!isSearching && (
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
        )}
      </div>

      {isSearching
        ? searchResultsByYear.map(([year, yearItems]) => (
            <div className="publications" data-aos="fade-down" key={year}>
              <h2 className="bibliography">{year}</h2>
              <ol className="bibliography">
                {yearItems.map(({ publication, authors, abstractHtml }) => (
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
          ))
        : (
            <div className="publications" data-aos="fade-down">
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
          )}
    </>
  );
}
