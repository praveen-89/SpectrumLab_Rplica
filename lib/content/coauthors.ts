import "server-only";
import { unstable_cache } from "next/cache";
import { supabasePublic } from "../supabase/public";

const fetchCoauthors = unstable_cache(
  async () => {
    const { data: rows, error } = await supabasePublic.from("coauthors").select("name_key, data");
    if (error) throw new Error(`Failed to read coauthors from Supabase: ${error.message}`);
    return rows;
  },
  ["coauthors"],
  { revalidate: 10, tags: ["coauthors"] },
);

/** Maps an author name variant (as it appears in papers.bib) to a /people/ profile URL — read from Supabase's coauthors table. */
export async function readCoauthors(): Promise<Record<string, string>> {
  const rows = await fetchCoauthors();
  return Object.fromEntries(rows.map((row) => [row.name_key, (row.data as { href: string }).href]));
}
