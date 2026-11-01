import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CoauthorsList, { type CoauthorRow } from "@/Admin/frontend/components/CoauthorsList";

export const metadata: Metadata = { title: "Coauthors" };

export default async function AdminCoauthorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("coauthors").select("id, name_key, data").order("name_key");
  if (error) throw new Error(error.message);

  const coauthors: CoauthorRow[] = rows.map((row) => ({ id: row.id, nameKey: row.name_key, href: (row.data as { href: string }).href }));

  return <CoauthorsList coauthors={coauthors} />;
}
