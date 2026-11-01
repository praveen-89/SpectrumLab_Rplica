import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PublicationsList, { type PublicationRow } from "@/Admin/frontend/components/PublicationsList";

export const metadata: Metadata = { title: "Publications" };

export default async function AdminPublicationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("publications")
    .select("key, data")
    .order("year", { ascending: false })
    .order("bib_order", { ascending: true });
  if (error) throw new Error(error.message);

  const publications: PublicationRow[] = rows.map((row) => {
    const data = row.data as { year: number; title: string; authors: string[]; type: string };
    return { key: row.key, year: data.year, title: data.title, authors: data.authors, type: data.type };
  });

  return <PublicationsList publications={publications} />;
}
