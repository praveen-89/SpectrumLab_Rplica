import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HomePageForm, { type HomePageFormValues } from "@/Admin/frontend/components/HomePageForm";
import { updateHomePage } from "@/Admin/backend/actions/pages-actions";

export const metadata: Metadata = { title: "Home Page" };

export default async function AdminHomePagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("pages").select("data").eq("slug", "home").single();
  if (error) throw new Error(error.message);

  return <HomePageForm initial={row.data as HomePageFormValues} updateAction={updateHomePage} />;
}
