import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NewsList, { type NewsRow } from "@/Admin/frontend/components/NewsList";

export const metadata: Metadata = { title: "News" };

export default async function AdminNewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("news").select("id, data").order("item_date", { ascending: false });
  if (error) throw new Error(error.message);

  const items: NewsRow[] = rows.map((row) => {
    const data = row.data as { date: string; category?: string; title?: string; slug: string; detailSlug?: string };
    return { id: row.id, date: data.date, category: data.category, title: data.title ?? data.slug, hasDetailPage: Boolean(data.detailSlug) };
  });

  return <NewsList items={items} />;
}
