import "server-only";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import matter from "gray-matter";
import type { z } from "zod";

const CONTENT_ROOT = join(process.cwd(), "content");

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".md")) return [fullPath];
      return [];
    }),
  );
  return files.flat();
}

function slugFromPath(dir: string, filePath: string): string {
  const rel = relative(dir, filePath).replace(/\.md$/, "");
  return rel.split(sep).join("/");
}

const cache = new Map<string, unknown[]>();
// See lib/content/page.ts — caching is only safe for next build's single
// pass; next dev keeps this module alive across content edits.
const CACHE_ENABLED = process.env.NODE_ENV === "production";

/** Reads and validates every Markdown file under content/<dir>. Cached per directory for the build. */
export async function readCollection<Schema extends z.ZodType>(
  dir: string,
  schema: Schema,
): Promise<Array<z.infer<Schema> & { slug: string }>> {
  const cached = CACHE_ENABLED ? cache.get(dir) : undefined;
  if (cached) return cached as Array<z.infer<Schema> & { slug: string }>;

  const collectionDir = join(CONTENT_ROOT, dir);
  const files = await listMarkdownFiles(collectionDir);

  const items = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf-8");
      const { data, content } = matter(raw);
      const result = schema.safeParse({ ...data, body: data.body ?? content.trim() });
      if (!result.success) {
        const [issue] = result.error.issues;
        throw new Error(
          `Invalid front matter in ${filePath}: ${issue.path.join(".")} — ${issue.message}`,
        );
      }
      return {
        ...(result.data as Record<string, unknown>),
        slug: slugFromPath(collectionDir, filePath),
      } as z.infer<Schema> & { slug: string };
    }),
  );

  cache.set(dir, items);
  return items;
}
