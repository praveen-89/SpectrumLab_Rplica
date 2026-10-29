import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";
import type { z } from "zod";

const PAGES_DIR = join(process.cwd(), "content", "pages");

const cache = new Map<string, unknown>();

/** Reads and validates a single Markdown page under content/pages/<slug>.md. */
export async function readPage<Schema extends z.ZodType>(
  slug: string,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const cached = cache.get(slug);
  if (cached) return cached as z.infer<Schema>;

  const filePath = join(PAGES_DIR, `${slug}.md`);
  const raw = await readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const result = schema.safeParse({ ...data, body: content.trim() });
  if (!result.success) {
    const [issue] = result.error.issues;
    throw new Error(
      `Invalid front matter in ${filePath}: ${issue.path.join(".")} — ${issue.message}`,
    );
  }

  cache.set(slug, result.data);
  return result.data;
}
