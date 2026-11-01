import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FundersList, { type FunderRow } from "@/Admin/frontend/components/FundersList";

export const metadata: Metadata = { title: "Funders" };

export default async function AdminFundersPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("funders").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const funders: FunderRow[] = rows.map((row) => {
    const data = row.data as { name: string; logo: string };
    return { id: row.id, name: data.name, logo: data.logo };
  });

  return <FundersList funders={funders} />;
}
