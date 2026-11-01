import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createGrant, updateGrant, deleteGrant } from "@/Admin/backend/actions/grants-actions";

export const metadata: Metadata = { title: "Grants" };

const PLACEHOLDER = JSON.stringify(
  { title: "Project title", institution: "Funding institution", role: "PI", startYear: 2024, endYear: 2026 },
  null,
  2,
);

export default async function AdminGrantsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("grants").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Grants</h1>
      <p>Shown on the Funding page.</p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title: string }).title}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateGrant.bind(null, row.id)}
          deleteAction={deleteGrant.bind(null, row.id)}
        />
      ))}

      <h2>Add a grant</h2>
      <JsonCreateForm createAction={createGrant} placeholder={PLACEHOLDER} />
    </div>
  );
}
