import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SingletonEditor from "@/Admin/frontend/components/SingletonEditor";
import { updatePeopleGroupsConfig } from "@/Admin/backend/actions/site-config-actions";

export const metadata: Metadata = { title: "People Group Labels" };

export default async function AdminPeopleGroupsConfigPage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("site_config").select("data").eq("key", "people-groups").single();
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>People Group Labels</h1>
      <p>The title/description shown at the top of each /people/&lt;group&gt;/ listing page.</p>
      <SingletonEditor initialJson={JSON.stringify(row.data, null, 2)} updateAction={updatePeopleGroupsConfig} />
    </div>
  );
}
