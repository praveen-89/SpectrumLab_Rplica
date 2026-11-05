import "server-only";
import type { z } from "zod";
import { supabasePublic } from "../supabase/public";

const TABLE_BY_FILE: Record<string, { table: string; orderColumn: string }> = {
  "funders.json": { table: "funders", orderColumn: "sort_order" },
  "grants.json": { table: "grants", orderColumn: "sort_order" },
  "recognition.json": { table: "recognition", orderColumn: "sort_order" },
  "gallery-photos.json": { table: "gallery_events", orderColumn: "sort_order" },
  "gallery-videos.json": { table: "gallery_videos", orderColumn: "sort_order" },
};

// Small, rarely-changing lists that don't warrant their own table — one
// row in site_config instead, keyed by name, holding the whole array.
const SITE_CONFIG_ARRAY_BY_FILE: Record<string, string> = {
  "people-groups.json": "people-groups",
};

/** Reads and validates a content array from Supabase — the admin-managed equivalent of the old /data/<file>.json. */
export async function readData<Schema extends z.ZodType>(
  file: string,
  schema: Schema,
): Promise<Array<z.infer<Schema>>> {
  const arraySchema = schema.array();

  const configKey = SITE_CONFIG_ARRAY_BY_FILE[file];
  if (configKey) {
    const { data: row, error } = await supabasePublic.from("site_config").select("data").eq("key", configKey).single();
    if (error) throw new Error(`Failed to read ${file} from Supabase: ${error.message}`);

    const result = arraySchema.safeParse(row.data);
    if (!result.success) {
      const [issue] = result.error.issues;
      throw new Error(`Invalid data in ${file}: ${issue.path.join(".")} — ${issue.message}`);
    }
    return result.data;
  }

  const mapping = TABLE_BY_FILE[file];
  if (!mapping) throw new Error(`readData: no Supabase table mapped for "${file}"`);

  const { data: rows, error } = await supabasePublic
    .from(mapping.table)
    .select("data")
    .order(mapping.orderColumn, { ascending: true });
  if (error) throw new Error(`Failed to read ${file} from Supabase: ${error.message}`);

  const result = arraySchema.safeParse(rows.map((row) => row.data));
  if (!result.success) {
    const [issue] = result.error.issues;
    throw new Error(`Invalid data in ${file}: ${issue.path.join(".")} — ${issue.message}`);
  }
  return result.data;
}
