import "server-only";
import { supabasePublic } from "../supabase/public";

/** Maps an author name variant (as it appears in papers.bib) to a /people/ profile URL — read from Supabase's coauthors table. */
export async function readCoauthors(): Promise<Record<string, string>> {
  const { data: rows, error } = await supabasePublic.from("coauthors").select("name_key, data");
  if (error) throw new Error(`Failed to read coauthors from Supabase: ${error.message}`);
  return Object.fromEntries(rows.map((row) => [row.name_key, (row.data as { href: string }).href]));
}
