import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { funderSchema, type Funder } from "@/lib/content/schemas";
import FunderRow from "@/Admin/frontend/components/FunderRow";
import FunderCreateForm from "@/Admin/frontend/components/FunderCreateForm";

export const metadata: Metadata = { title: "Funders" };

export default async function AdminFundersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("funders").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const funders = rows.map((row) => ({ id: row.id as string, funder: funderSchema.parse(row.data) as Funder }));

  return (
    <div>
      <h1>Funders</h1>
      <p>Shown on the Funding page and the home page&apos;s carousel.</p>

      {funders.map(({ id, funder }) => (
        <FunderRow key={id} id={id} funder={funder} />
      ))}

      <h2>Add a funder</h2>
      <FunderCreateForm />
    </div>
  );
}
