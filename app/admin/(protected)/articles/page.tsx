import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createArticle, updateArticle, deleteArticle } from "@/Admin/backend/actions/articles-actions";

export const metadata: Metadata = { title: "Articles" };

const PLACEHOLDER = JSON.stringify(
  { slug: "example-article", title: "Article title", excerpt: "Short excerpt.", date: "2026-01-01", authors: [], body: "" },
  null,
  2,
);

export default async function AdminArticlesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("articles").select("id, data").order("item_date", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Articles</h1>
      <p>
        Shown on the Articles page. The <code>slug</code> field is this article&apos;s URL and unique identifier.
      </p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title: string }).title}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateArticle.bind(null, row.id)}
          deleteAction={deleteArticle.bind(null, row.id)}
        />
      ))}

      <h2>Add an article</h2>
      <JsonCreateForm createAction={createArticle} placeholder={PLACEHOLDER} />
    </div>
  );
}
