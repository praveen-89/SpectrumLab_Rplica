import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createCoauthor, updateCoauthor, deleteCoauthor } from "@/Admin/backend/actions/coauthors-actions";

export const metadata: Metadata = { title: "Coauthors" };

function NameKeyField({ defaultValue }: { defaultValue?: string }) {
  return <input name="name_key" placeholder="Name as it appears in BibTeX (e.g. C. S. Seelamantula)" defaultValue={defaultValue} required />;
}

export default async function AdminCoauthorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("coauthors").select("id, name_key, data").order("name_key");
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Coauthors</h1>
      <p>
        Maps an author name variant (exactly as it appears in a publication&apos;s author list) to a /people/
        profile URL, so that name links to their profile on the Publications page.
      </p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={row.name_key}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateCoauthor.bind(null, row.id)}
          deleteAction={deleteCoauthor.bind(null, row.id)}
          extraFields={<NameKeyField defaultValue={row.name_key} />}
        />
      ))}

      <h2>Add a name mapping</h2>
      <JsonCreateForm
        createAction={createCoauthor}
        placeholder={JSON.stringify({ href: "/people/current/phd-students/example_person/" }, null, 2)}
        extraFields={<NameKeyField />}
      />
    </div>
  );
}
