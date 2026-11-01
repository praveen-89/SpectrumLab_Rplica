import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createPerson, updatePerson, deletePerson } from "@/Admin/backend/actions/people-actions";

export const metadata: Metadata = { title: "People" };

const PLACEHOLDER = JSON.stringify(
  { slug: "example_person", name: "Person Name", group: "phd-students", body: "Short bio." },
  null,
  2,
);

function StatusYearFields({ status, year }: { status?: string; year?: number | null }) {
  return (
    <>
      <select name="status" defaultValue={status ?? "current"} required>
        <option value="current">Current</option>
        <option value="alumni">Alumni</option>
      </select>
      <input name="year" type="number" placeholder="Alumni year (if alumni)" defaultValue={year ?? ""} />
    </>
  );
}

type PersonRow = { id: string; group: string; status: string; year: number | null; data: { name: string; slug: string } };

export default async function AdminPeoplePage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("people")
    .select("id, group, status, year, data")
    .order("group", { ascending: true })
    .order("status", { ascending: true });
  if (error) throw new Error(error.message);

  const people = rows as unknown as PersonRow[];

  return (
    <div>
      <h1>People</h1>
      <p>
        The <code>slug</code> and <code>group</code> fields are part of the JSON. &quot;Status&quot; and
        &quot;Alumni year&quot; below control which URL the person lives at (<code>/people/current/...</code> vs{" "}
        <code>/people/alumni/.../&lt;year&gt;/...</code>).
      </p>

      {people.map((person) => (
        <JsonRow
          key={person.id}
          label={`${person.data.name} (${person.group}, ${person.status})`}
          initialJson={JSON.stringify(person.data, null, 2)}
          updateAction={updatePerson.bind(null, person.id)}
          deleteAction={deletePerson.bind(null, person.id, person.group, person.status, person.year, person.data.slug)}
          extraFields={<StatusYearFields status={person.status} year={person.year} />}
        />
      ))}

      <h2>Add a person</h2>
      <JsonCreateForm createAction={createPerson} placeholder={PLACEHOLDER} extraFields={<StatusYearFields />} />
    </div>
  );
}
