import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CourseForm from "@/Admin/frontend/components/CourseForm";
import { updateCourse, deleteCourse } from "@/Admin/backend/actions/teaching-actions";

export const metadata: Metadata = { title: "Edit Course" };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("teaching").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { slug: string; code?: string; title: string; section: string; term?: string; description?: string; body?: string };

  return (
    <CourseForm
      initial={{
        slug: data.slug,
        code: data.code ?? "",
        title: data.title,
        section: data.section,
        term: data.term ?? "",
        description: data.description ?? "",
        body: data.body ?? "",
      }}
      updateAction={updateCourse.bind(null, id)}
      deleteAction={deleteCourse.bind(null, id)}
    />
  );
}
