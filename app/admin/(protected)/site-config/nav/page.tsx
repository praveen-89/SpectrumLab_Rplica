import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SingletonEditor from "@/Admin/frontend/components/SingletonEditor";
import { updateNavConfig } from "@/Admin/backend/actions/site-config-actions";

export const metadata: Metadata = { title: "Navigation" };

export default async function AdminNavConfigPage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("site_config").select("data").eq("key", "nav").single();
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Navigation</h1>
      <p>
        <strong>Caution:</strong> this controls the navbar on every page and the Ctrl+K search&apos;s Navigation
        section. A malformed entry here breaks navigation site-wide.
      </p>
      <SingletonEditor initialJson={JSON.stringify(row.data, null, 2)} updateAction={updateNavConfig} />
    </div>
  );
}
