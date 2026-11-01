import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ArticlesList, { type ArticleRow } from "@/Admin/frontend/components/ArticlesList";

export const metadata: Metadata = { title: "Articles" };

export default async function AdminArticlesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("articles").select("id, data").order("item_date", { ascending: false });
  if (error) throw new Error(error.message);

  const articles: ArticleRow[] = rows.map((row) => {
    const data = row.data as { title: string; date?: string };
    return { id: row.id, title: data.title, date: data.date };
  });

  return <ArticlesList articles={articles} />;
}
