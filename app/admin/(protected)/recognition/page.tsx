import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RecognitionList, { type RecognitionRow } from "@/Admin/frontend/components/RecognitionList";

export const metadata: Metadata = { title: "Recognition" };

export default async function AdminRecognitionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("recognition").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const items: RecognitionRow[] = rows.map((row) => {
    const data = row.data as { title: string; year?: string; type: string };
    return { id: row.id, title: data.title, year: data.year, type: data.type };
  });

  return <RecognitionList items={items} />;
}
