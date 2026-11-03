import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PersonForm from "@/Admin/frontend/components/PersonForm";
import { updatePerson, deletePerson } from "@/Admin/backend/actions/people-actions";

export const metadata: Metadata = { title: "Edit Person" };

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("people").select("id, group, status, year, data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as {
    slug: string;
    name: string;
    group: string;
    image?: string;
    summary?: string;
    body: string;
    links?: Record<string, string>;
  };

  const leafSlug = data.slug.includes("/")
    ? data.slug.split("/").filter(Boolean).pop() || data.slug
    : data.slug;

  return (
    <PersonForm
      initial={{
        slug: leafSlug,
        name: data.name,
        group: row.group,
        status: row.status as "current" | "alumni",
        year: row.year ? String(row.year) : "",
        image: data.image ?? "",
        summary: data.summary ?? "",
        body: data.body,
        links: {
          email: data.links?.email ?? "",
          scholar: data.links?.scholar ?? "",
          github: data.links?.github ?? "",
          twitter: data.links?.twitter ?? "",
          linkedin: data.links?.linkedin ?? "",
          website: data.links?.website ?? "",
        },
      }}
      updateAction={updatePerson.bind(null, id, data.slug)}
      deleteAction={deletePerson.bind(null, id, row.group, row.status, row.year, data.slug)}
    />
  );
}
