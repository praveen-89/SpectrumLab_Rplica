import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GrantsList, { type GrantRow } from "@/Admin/frontend/components/GrantsList";

export const metadata: Metadata = { title: "Grants" };

export default async function AdminGrantsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("grants").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const grants: GrantRow[] = rows.map((row) => {
    const data = row.data as { title: string; institution: string; startYear: number; endYear?: number };
    return { id: row.id, title: data.title, institution: data.institution, startYear: data.startYear, endYear: data.endYear };
  });

  return <GrantsList grants={grants} />;
}
