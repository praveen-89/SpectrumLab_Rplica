import "server-only";
import { cache } from "react";
import type { z } from "zod";
import { supabasePublic } from "../supabase/public";

/** Reads and validates a single page's content from Supabase — the admin-managed equivalent of the old content/pages/<slug>.md. */
export const readPage = cache(async function readPage<Schema extends z.ZodType>(
  slug: string,
  schema: Schema,
): Promise<z.infer<Schema>> {
  const { data: row, error } = await supabasePublic.from("pages").select("data").eq("slug", slug).single();
  if (error) throw new Error(`Failed to read page "${slug}" from Supabase: ${error.message}`);

  const result = schema.safeParse(row.data);
  if (!result.success) {
    const [issue] = result.error.issues;
    throw new Error(`Invalid data for page "${slug}": ${issue.path.join(".")} — ${issue.message}`);
  }
  return result.data;
});
