import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createPublication, updatePublication, deletePublication } from "@/Admin/backend/actions/publications-actions";

export const metadata: Metadata = { title: "Publications" };

const PLACEHOLDER = JSON.stringify(
  {
    key: "author2026example",
    type: "article",
    year: 2026,
    title: "Paper title",
    authors: ["A. Author", "C. S. Seelamantula"],
    venue: "Journal or conference name",
    bibtex: "@article{author2026example, ...}",
  },
  null,
  2,
);

export default async function AdminPublicationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("publications")
    .select("key, data")
    .order("year", { ascending: false })
    .order("bib_order", { ascending: true });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Publications</h1>
      <p>
        The <code>key</code> field is the BibTeX citekey and this entry&apos;s unique identifier — keep it stable
        once set. <code>bibtex</code> should contain the full BibTeX entry text.
      </p>

      {rows.map((row) => (
        <JsonRow
          key={row.key}
          label={`${(row.data as { title: string }).title} (${row.key})`}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updatePublication.bind(null, row.key)}
          deleteAction={deletePublication.bind(null, row.key)}
        />
      ))}

      <h2>Add a publication</h2>
      <JsonCreateForm createAction={createPublication} placeholder={PLACEHOLDER} />
    </div>
  );
}
