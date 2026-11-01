import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SingletonEditor from "@/Admin/frontend/components/SingletonEditor";
import { updateHomePage } from "@/Admin/backend/actions/pages-actions";

export const metadata: Metadata = { title: "Home Page" };

export default async function AdminHomePagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("pages").select("data").eq("slug", "home").single();
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Home Page</h1>
      <SingletonEditor initialJson={JSON.stringify(row.data, null, 2)} updateAction={updateHomePage} />
    </div>
  );
}
