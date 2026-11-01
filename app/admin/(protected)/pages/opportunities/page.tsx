import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SingletonEditor from "@/Admin/frontend/components/SingletonEditor";
import { updateOpportunitiesPage } from "@/Admin/backend/actions/pages-actions";

export const metadata: Metadata = { title: "Opportunities Page" };

export default async function AdminOpportunitiesPagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("pages").select("data").eq("slug", "opportunities").single();
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Opportunities Page</h1>
      <SingletonEditor initialJson={JSON.stringify(row.data, null, 2)} updateAction={updateOpportunitiesPage} />
    </div>
  );
}
