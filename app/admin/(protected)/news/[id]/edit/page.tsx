import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NewsForm from "@/Admin/frontend/components/NewsForm";
import { updateNews, deleteNews } from "@/Admin/backend/actions/news-actions";

export const metadata: Metadata = { title: "Edit News" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("news").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { slug: string; date: string; category?: string; title?: string; link?: string; detailSlug?: string; body?: string };

  return (
    <NewsForm
      initial={{
        slug: data.slug,
        date: data.date,
        category: data.category ?? "",
        title: data.title ?? "",
        link: data.link ?? "",
        hasDetailPage: Boolean(data.detailSlug),
        body: data.body ?? "",
      }}
      updateAction={updateNews.bind(null, id)}
      deleteAction={deleteNews.bind(null, id)}
    />
  );
}
