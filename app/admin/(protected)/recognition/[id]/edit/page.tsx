import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RecognitionForm from "@/Admin/frontend/components/RecognitionForm";
import { updateRecognition, deleteRecognition } from "@/Admin/backend/actions/recognition-actions";

export const metadata: Metadata = { title: "Edit Recognition" };

export default async function EditRecognitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("recognition").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { title: string; year?: string; type: string; people: Array<{ name: string }> };

  return (
    <RecognitionForm
      initial={{ title: data.title, year: data.year ?? "", type: data.type, people: data.people.map((p) => p.name).join(", ") }}
      updateAction={updateRecognition.bind(null, id)}
      deleteAction={deleteRecognition.bind(null, id)}
    />
  );
}
