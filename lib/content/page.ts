import "server-only";
import type { z } from "zod";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "../supabase/public";

/** Reads and validates a single page's content from Supabase — the admin-managed equivalent of the old content/pages/<slug>.md. */
export async function readPage<Schema extends z.ZodType>(slug: string, schema: Schema): Promise<z.infer<Schema>> {
  const fetchRow = unstable_cache(
    async () => {
      const { data: row, error } = await supabasePublic.from("pages").select("data").eq("slug", slug).single();
      if (error) throw new Error(`Failed to read page "${slug}" from Supabase: ${error.message}`);
      return row.data;
    },
    [slug],
    { revalidate: 10, tags: [slug] },
  );

  const data = await fetchRow();
  const result = schema.safeParse(data);
  if (!result.success) {
    const [issue] = result.error.issues;
    throw new Error(`Invalid data for page "${slug}": ${issue.path.join(".")} — ${issue.message}`);
  }
  return result.data;
}
