import "server-only";
import { cache } from "react";
import type { z } from "zod";
import { supabasePublic } from "../supabase/public";

type CollectionSource = { table: string; filter?: Record<string, string> };

const SOURCE_BY_DIR: Record<string, CollectionSource> = {
  people: { table: "people" },
  news: { table: "news" },
  articles: { table: "articles" },
  teaching: { table: "teaching" },
  "talks/organized": { table: "talks", filter: { kind: "organized" } },
  "talks/delivered": { table: "talks", filter: { kind: "delivered" } },
};

/**
 * Reads and validates every row of a content collection from Supabase —
 * the admin-managed equivalent of the old content/<dir>/**.md files. Each
 * row's `data` column already carries the same `slug` field the old
 * filesystem version derived from the file's path (preserved verbatim by
 * the migration script), so the returned shape is unchanged.
 */
export const readCollection = cache(async function readCollection<Schema extends z.ZodType>(
  dir: string,
  schema: Schema,
): Promise<Array<z.infer<Schema> & { slug: string }>> {
  const source = SOURCE_BY_DIR[dir];
  if (!source) throw new Error(`readCollection: no Supabase table mapped for "${dir}"`);

  let query = supabasePublic.from(source.table).select("data");
  for (const [column, value] of Object.entries(source.filter ?? {})) {
    query = query.eq(column, value);
  }
  const { data: rows, error } = await query;
  if (error) throw new Error(`Failed to read ${dir} from Supabase: ${error.message}`);

  return rows.map((row) => {
    const result = schema.safeParse(row.data);
    if (!result.success) {
      const [issue] = result.error.issues;
      throw new Error(`Invalid data for ${dir} row: ${issue.path.join(".")} — ${issue.message}`);
    }
    return { ...(result.data as Record<string, unknown>), slug: (row.data as { slug: string }).slug } as z.infer<Schema> & {
      slug: string;
    };
  });
});
