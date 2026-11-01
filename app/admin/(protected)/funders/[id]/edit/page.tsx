import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FunderForm from "@/Admin/frontend/components/FunderForm";
import { updateFunder, deleteFunder } from "@/Admin/backend/actions/funders-actions";

export const metadata: Metadata = { title: "Edit Funder" };

export default async function EditFunderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("funders").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { name: string; logo: string; url?: string };

  return (
    <FunderForm
      initial={{ name: data.name, logo: data.logo, url: data.url ?? "" }}
      updateAction={updateFunder.bind(null, id)}
      deleteAction={deleteFunder.bind(null, id)}
    />
  );
}
