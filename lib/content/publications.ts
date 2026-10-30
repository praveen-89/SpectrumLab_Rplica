import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, type Entry } from "@retorquere/bibtex-parser/js";
import { publicationSchema, type Publication } from "./schemas";
import { renderMarkdown } from "./markdown";
import type { PublicationView } from "../publications-view";

const BIB_PATH = join(process.cwd(), "content", "papers.bib");

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// BibTeX's predefined month macros (bare "apr" etc., no braces/quotes) are
// expanded by this parser to the plain cardinal number ("4"), not the
// name — so the loader normalizes to a 3-letter name ("Apr") for display,
// accepting either form as input (numeric or already-named).
function formatMonth(month: string | undefined): string | undefined {
  if (!month) return undefined;
  const trimmed = month.trim();
  const asNumber = Number(trimmed);
  if (Number.isInteger(asNumber) && asNumber >= 1 && asNumber <= 12) {
    return MONTH_NAMES[asNumber - 1];
  }
  const index = MONTH_NAMES.findIndex((name) => name.toLowerCase() === trimmed.slice(0, 3).toLowerCase());
  return index >= 0 ? MONTH_NAMES[index] : trimmed;
}

// "firstName lastName" order matches the "S. Mandal" / "C. S. Seelamantula"
// name-variant keys in data/coauthors.json, built from the same source page.
function formatAuthors(entry: Entry): string[] {
  const authors = entry.fields.author;
  if (!authors) return [];
  return authors.map(
    (author) => author.name ?? [author.firstName, author.lastName].filter(Boolean).join(" "),
  );
}

function field(entry: Entry, name: string): string | undefined {
  const value = entry.fields[name];
  return typeof value === "string" ? value : undefined;
}

function toPublication(entry: Entry): Publication {
  const year = Number(field(entry, "year"));
  return publicationSchema.parse({
    key: entry.key,
    type: entry.type,
    year: Number.isFinite(year) ? year : 0,
    month: formatMonth(field(entry, "month")),
    title: field(entry, "title") ?? "",
    authors: formatAuthors(entry),
    venue: field(entry, "booktitle") ?? field(entry, "journal") ?? field(entry, "publisher"),
    abbr: field(entry, "abbr"),
    abstract: field(entry, "abstract"),
    doi: field(entry, "doi"),
    url: field(entry, "url") ?? field(entry, "html"),
    code: field(entry, "code"),
    articlePage: field(entry, "article_page"),
    pdf: field(entry, "pdf"),
    bibtex: entry.input,
  });
}

let cached: Publication[] | undefined;

/** Reads, validates and sorts (newest first) every entry in content/papers.bib. Cached for the build. */
export async function readPublications(): Promise<Publication[]> {
  if (cached) return cached;

  const raw = await readFile(BIB_PATH, "utf-8");
  // "abstract" is parsed verbatim so inline LaTeX math ("$\mathbf{...}$")
  // survives intact for our own markdown + KaTeX pipeline, instead of
  // being normalized/stripped like author and title text should be.
  // sentenceCase: false keeps titles/venues exactly as written in the
  // source BibTeX ("Velocity Adaptation for Flow-Matching Models"), rather
  // than the parser's default heuristic re-casing to sentence case.
  const { entries, errors } = parse(raw, {
    verbatimFields: ["abstract"],
    sentenceCase: false,
  });
  // Per the parser's own docs, these are recoverable diagnostics (e.g. an
  // unrecognised LaTeX macro inside an abstract) — entries are still
  // returned. Only treat parsing as having failed if nothing came back.
  if (entries.length === 0 && errors.length > 0) {
    throw new Error(`Failed to parse ${BIB_PATH}: ${errors.map((error) => error.error).join("; ")}`);
  }
  if (errors.length > 0) {
    console.warn(
      `readPublications: ${errors.length} recoverable diagnostic(s) from ${BIB_PATH}: ${errors
        .map((error) => error.error)
        .join("; ")}`,
    );
  }

  // Sort by year only; Array#sort is stable (guaranteed by spec), so
  // entries from the same year keep their relative order from papers.bib,
  // which already matches the original page's order.
  const publications = entries.map(toPublication).sort((a, b) => b.year - a.year);

  cached = publications;
  return publications;
}

/**
 * Resolves each publication's authors against the coauthor name-variant
 * map (linking lab members, italicizing the director) and renders its
 * abstract to HTML — the per-entry prep shared by the home page's Recent
 * Publications and the full Publications page.
 */
export async function buildPublicationViews(
  publications: Publication[],
  coauthors: Record<string, string>,
  directorHref: string | undefined,
): Promise<PublicationView[]> {
  return Promise.all(
    publications.map(async (publication) => {
      const authors = publication.authors.map((name) => {
        const href = coauthors[name];
        return { name, href, italic: href === directorHref };
      });
      const abstractHtml = publication.abstract ? await renderMarkdown(publication.abstract) : undefined;
      return { publication, authors, abstractHtml };
    }),
  );
}
