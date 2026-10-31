import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const COAUTHORS_PATH = join(process.cwd(), "data", "coauthors.json");

const coauthorsSchema = z.record(z.string(), z.string());

let cached: Record<string, string> | undefined;
// See lib/content/page.ts — caching is only safe for next build's single
// pass; next dev keeps this module alive across content edits.
const CACHE_ENABLED = process.env.NODE_ENV === "production";

/** Maps an author name variant (as it appears in papers.bib) to a /people/ profile URL. */
export async function readCoauthors(): Promise<Record<string, string>> {
  if (CACHE_ENABLED && cached) return cached;
  const raw = await readFile(COAUTHORS_PATH, "utf-8");
  cached = coauthorsSchema.parse(JSON.parse(raw));
  return cached;
}
