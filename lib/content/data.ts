import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { z } from "zod";

const DATA_ROOT = join(process.cwd(), "data");

const cache = new Map<string, unknown>();
// See lib/content/page.ts — caching is only safe for next build's single
// pass; next dev keeps this module alive across content edits.
const CACHE_ENABLED = process.env.NODE_ENV === "production";

/** Reads and validates a JSON file under /data. Cached per file for the build. */
export async function readData<Schema extends z.ZodType>(
  file: string,
  schema: Schema,
): Promise<Array<z.infer<Schema>>> {
  const cached = CACHE_ENABLED ? cache.get(file) : undefined;
  if (cached) return cached as Array<z.infer<Schema>>;

  const filePath = join(DATA_ROOT, file);
  const raw = await readFile(filePath, "utf-8");
  const json = JSON.parse(raw);
  const arraySchema = schema.array();
  const result = arraySchema.safeParse(json);
  if (!result.success) {
    const [issue] = result.error.issues;
    throw new Error(`Invalid data in ${filePath}: ${issue.path.join(".")} — ${issue.message}`);
  }

  cache.set(file, result.data);
  return result.data;
}
