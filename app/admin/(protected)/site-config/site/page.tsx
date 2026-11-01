import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SingletonEditor from "@/Admin/frontend/components/SingletonEditor";
import { updateSiteConfig } from "@/Admin/backend/actions/site-config-actions";

export const metadata: Metadata = { title: "Site Settings" };

export default async function AdminSiteConfigPage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("site_config").select("data").eq("key", "site").single();
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Site Settings</h1>
      <p>
        <strong>Caution:</strong> this controls site-wide metadata (page titles, description) and social links used
        across every page.
      </p>
      <SingletonEditor initialJson={JSON.stringify(row.data, null, 2)} updateAction={updateSiteConfig} />
    </div>
  );
}
