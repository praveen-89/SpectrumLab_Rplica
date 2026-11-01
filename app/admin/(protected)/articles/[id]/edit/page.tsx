import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ArticleForm from "@/Admin/frontend/components/ArticleForm";
import { updateArticle, deleteArticle } from "@/Admin/backend/actions/articles-actions";

export const metadata: Metadata = { title: "Edit Article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("articles").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { slug: string; title: string; date?: string; excerpt: string; body: string };

  return (
    <ArticleForm
      initial={{ slug: data.slug, title: data.title, date: data.date ?? "", excerpt: data.excerpt, body: data.body, youtubeId: "" }}
      updateAction={updateArticle.bind(null, id)}
      deleteAction={deleteArticle.bind(null, id)}
    />
  );
}
