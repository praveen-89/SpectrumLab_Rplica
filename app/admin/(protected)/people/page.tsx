import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PeopleList, { type PersonRow } from "@/Admin/frontend/components/PeopleList";

export const metadata: Metadata = { title: "People" };

export default async function AdminPeoplePage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("people")
    .select("id, group, status, year, data")
    .order("group", { ascending: true })
    .order("status", { ascending: true });
  if (error) throw new Error(error.message);

  const people: PersonRow[] = rows.map((row) => ({
    id: row.id,
    group: row.group,
    status: row.status,
    year: row.year,
    name: (row.data as { name: string }).name,
    slug: (row.data as { slug: string }).slug,
    image: (row.data as { image?: string }).image,
  }));

  return <PeopleList people={people} />;
}
