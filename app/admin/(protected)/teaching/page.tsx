import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createCourse, updateCourse, deleteCourse } from "@/Admin/backend/actions/teaching-actions";

export const metadata: Metadata = { title: "Teaching" };

const PLACEHOLDER = JSON.stringify({ slug: "example-course", title: "Course title", section: "regular" }, null, 2);

export default async function AdminTeachingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("teaching").select("id, data");
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Teaching</h1>
      <p>
        Shown on the Teaching page. <code>section</code> must be &quot;regular&quot;, &quot;short&quot;, or
        &quot;module&quot;.
      </p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title: string }).title}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateCourse.bind(null, row.id)}
          deleteAction={deleteCourse.bind(null, row.id)}
        />
      ))}

      <h2>Add a course</h2>
      <JsonCreateForm createAction={createCourse} placeholder={PLACEHOLDER} />
    </div>
  );
}
