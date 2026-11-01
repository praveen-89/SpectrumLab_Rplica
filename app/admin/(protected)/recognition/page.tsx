import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createRecognition, updateRecognition, deleteRecognition } from "@/Admin/backend/actions/recognition-actions";

export const metadata: Metadata = { title: "Recognition" };

const PLACEHOLDER = JSON.stringify(
  { type: "fellowship", year: "2024", title: "Award title", people: [{ name: "Person Name" }], images: [] },
  null,
  2,
);

export default async function AdminRecognitionPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("recognition").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Recognition</h1>
      <p>Shown on the Recognition page.</p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title: string }).title}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateRecognition.bind(null, row.id)}
          deleteAction={deleteRecognition.bind(null, row.id)}
        />
      ))}

      <h2>Add a recognition entry</h2>
      <JsonCreateForm createAction={createRecognition} placeholder={PLACEHOLDER} />
    </div>
  );
}
