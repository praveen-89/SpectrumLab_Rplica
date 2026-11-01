import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CoauthorForm from "@/Admin/frontend/components/CoauthorForm";
import { updateCoauthor, deleteCoauthor } from "@/Admin/backend/actions/coauthors-actions";

export const metadata: Metadata = { title: "Edit Coauthor" };

export default async function EditCoauthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("coauthors").select("name_key, data").eq("id", id).single();
  if (!row) notFound();

  return (
    <CoauthorForm
      initial={{ nameKey: row.name_key, href: (row.data as { href: string }).href }}
      updateAction={updateCoauthor.bind(null, id)}
      deleteAction={deleteCoauthor.bind(null, id)}
    />
  );
}
