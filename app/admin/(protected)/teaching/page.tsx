import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CoursesList, { type CourseRow } from "@/Admin/frontend/components/CoursesList";

export const metadata: Metadata = { title: "Teaching" };

export default async function AdminTeachingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("teaching").select("id, data");
  if (error) throw new Error(error.message);

  const courses: CourseRow[] = rows.map((row) => {
    const data = row.data as { title: string; code?: string; section: string };
    return { id: row.id, title: data.title, code: data.code, section: data.section };
  });

  return <CoursesList courses={courses} />;
}
