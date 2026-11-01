import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createNews, updateNews, deleteNews } from "@/Admin/backend/actions/news-actions";

export const metadata: Metadata = { title: "News" };

const PLACEHOLDER = JSON.stringify(
  { slug: "2026-01-01-example-item", date: "2026-01-01", category: "Talk", title: "News item title" },
  null,
  2,
);

export default async function AdminNewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("news").select("id, data").order("item_date", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>News</h1>
      <p>
        Shown on the News page and the home page&apos;s latest-news list. The <code>slug</code> field is this
        item&apos;s unique identifier — keep it stable once set.
      </p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title?: string; slug: string }).title ?? (row.data as { slug: string }).slug}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateNews.bind(null, row.id)}
          deleteAction={deleteNews.bind(null, row.id)}
        />
      ))}

      <h2>Add a news item</h2>
      <JsonCreateForm createAction={createNews} placeholder={PLACEHOLDER} />
    </div>
  );
}
