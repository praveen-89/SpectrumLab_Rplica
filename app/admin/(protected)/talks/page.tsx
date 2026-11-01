import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createTalk, updateTalk, deleteTalk } from "@/Admin/backend/actions/talks-actions";

export const metadata: Metadata = { title: "Talks" };

const PLACEHOLDER = JSON.stringify({ slug: "2026/2026-01-01-example-talk", title: "Talk title", date: "2026-01-01" }, null, 2);

function KindField({ kind }: { kind: "organized" | "delivered" }) {
  return <input type="hidden" name="kind" value={kind} />;
}

async function TalkSection({ kind, label }: { kind: "organized" | "delivered"; label: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase
    .from("talks")
    .select("id, data")
    .eq("kind", kind)
    .order("year", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <section>
      <h2>{label}</h2>
      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title: string }).title}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateTalk.bind(null, row.id, kind)}
          deleteAction={deleteTalk.bind(null, row.id, kind)}
        />
      ))}

      <h3>Add a {kind} talk</h3>
      <JsonCreateForm createAction={createTalk} placeholder={PLACEHOLDER} extraFields={<KindField kind={kind} />} />
    </section>
  );
}

export default function AdminTalksPage() {
  return (
    <div>
      <h1>Talks</h1>
      <p>
        The <code>slug</code> field follows the &quot;year/leaf-slug&quot; convention (e.g.
        &quot;2026/2026-01-01-example-talk&quot;).
      </p>
      <TalkSection kind="organized" label="Organized" />
      <TalkSection kind="delivered" label="Delivered" />
    </div>
  );
}
