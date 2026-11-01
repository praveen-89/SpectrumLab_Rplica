import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PublicationForm from "@/Admin/frontend/components/PublicationForm";
import { updatePublication, deletePublication } from "@/Admin/backend/actions/publications-actions";

export const metadata: Metadata = { title: "Edit Publication" };

export default async function EditPublicationPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("publications").select("data").eq("key", key).single();
  if (!row) notFound();

  const data = row.data as {
    key: string;
    type: string;
    title: string;
    authors: string[];
    year: number;
    month?: string;
    venue?: string;
    abbr?: string;
    doi?: string;
    url?: string;
    pdf?: string;
    code?: string;
    articlePage?: string;
    abstract?: string;
    bibtex: string;
  };

  return (
    <PublicationForm
      initial={{
        key: data.key,
        type: data.type,
        title: data.title,
        authors: data.authors,
        year: String(data.year),
        month: data.month ?? "",
        venue: data.venue ?? "",
        abbr: data.abbr ?? "",
        doi: data.doi ?? "",
        url: data.url ?? "",
        pdf: data.pdf ?? "",
        code: data.code ?? "",
        articlePage: data.articlePage ?? "",
        abstract: data.abstract ?? "",
        bibtex: data.bibtex,
      }}
      updateAction={updatePublication.bind(null, key)}
      deleteAction={deletePublication.bind(null, key)}
    />
  );
}
