import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GrantForm from "@/Admin/frontend/components/GrantForm";
import { updateGrant, deleteGrant } from "@/Admin/backend/actions/grants-actions";

export const metadata: Metadata = { title: "Edit Grant" };

export default async function EditGrantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("grants").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { title: string; institution: string; role: string; startYear: number; endYear?: number; coInvestigators?: string };

  return (
    <GrantForm
      initial={{
        title: data.title,
        institution: data.institution,
        role: data.role,
        startYear: String(data.startYear),
        endYear: data.endYear ? String(data.endYear) : "",
        coInvestigators: data.coInvestigators ?? "",
      }}
      updateAction={updateGrant.bind(null, id)}
      deleteAction={deleteGrant.bind(null, id)}
    />
  );
}
