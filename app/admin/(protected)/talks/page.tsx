import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TalksList, { type TalkRow } from "@/Admin/frontend/components/TalksList";

export const metadata: Metadata = { title: "Talks" };

async function fetchTalks(kind: "organized" | "delivered"): Promise<TalkRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("talks").select("id, data").eq("kind", kind).order("year", { ascending: false });
  if (error) throw new Error(error.message);
  return rows.map((row) => {
    const data = row.data as { title: string; date: string; venue?: string };
    return { id: row.id, kind, date: data.date, title: data.title, venue: data.venue };
  });
}

export default async function AdminTalksPage() {
  const [organized, delivered] = await Promise.all([fetchTalks("organized"), fetchTalks("delivered")]);
  return <TalksList organized={organized} delivered={delivered} />;
}
