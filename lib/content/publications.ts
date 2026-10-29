import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, type Entry } from "@retorquere/bibtex-parser/js";
import { publicationSchema, type Publication } from "./schemas";

const BIB_PATH = join(process.cwd(), "content", "papers.bib");

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function monthToNumber(month: string | undefined): number {
  if (!month) return 0;
  const normalized = month.trim().toLowerCase().slice(0, 3);
  const index = MONTHS.indexOf(normalized);
  if (index >= 0) return index + 1;
  const asNumber = Number(month);
  return Number.isFinite(asNumber) ? asNumber : 0;
}

function formatAuthors(entry: Entry): string {
  const authors = entry.fields.author;
  if (!authors) return "";
  return authors
    .map((author) => author.name ?? [author.firstName, author.lastName].filter(Boolean).join(" "))
    .join(", ");
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
    month: field(entry, "month"),
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
  const { entries, errors } = parse(raw);
  if (errors.length > 0) {
    throw new Error(`Failed to parse ${BIB_PATH}: ${errors.map((error) => error.error).join("; ")}`);
  }

  const publications = entries
    .map(toPublication)
    .sort((a, b) => b.year - a.year || monthToNumber(b.month) - monthToNumber(a.month));

  cached = publications;
  return publications;
}
