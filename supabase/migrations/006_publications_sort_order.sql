-- readPublications() sorts by year, and for entries sharing a year keeps
-- their relative order from papers.bib (a stable sort) — the original
-- page's own rendering order. Postgres doesn't guarantee row order
-- without an explicit column to order by, so this records the source
-- file's original position for that tiebreak.
alter table publications add column bib_order integer not null default 0;
