import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const COAUTHORS_PATH = join(process.cwd(), "data", "coauthors.json");

const coauthorsSchema = z.record(z.string(), z.string());

let cached: Record<string, string> | undefined;

/** Maps an author name variant (as it appears in papers.bib) to a /people/ profile URL. */
export async function readCoauthors(): Promise<Record<string, string>> {
  if (cached) return cached;
  const raw = await readFile(COAUTHORS_PATH, "utf-8");
  cached = coauthorsSchema.parse(JSON.parse(raw));
  return cached;
}
