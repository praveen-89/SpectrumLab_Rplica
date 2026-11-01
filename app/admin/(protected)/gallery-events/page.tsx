import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createGalleryEvent, updateGalleryEvent, deleteGalleryEvent } from "@/Admin/backend/actions/gallery-actions";

export const metadata: Metadata = { title: "Gallery Photos" };

const PLACEHOLDER = JSON.stringify(
  { title: "Event title", description: "", photos: [{ src: "/assets/img/gallery/example.webp", caption: "" }] },
  null,
  2,
);

export default async function AdminGalleryEventsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("gallery_events").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Gallery Photos</h1>
      <p>Shown on the Gallery &gt; Photos page, grouped by event.</p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title?: string }).title ?? "(untitled event)"}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateGalleryEvent.bind(null, row.id)}
          deleteAction={deleteGalleryEvent.bind(null, row.id)}
        />
      ))}

      <h2>Add a photo event</h2>
      <JsonCreateForm createAction={createGalleryEvent} placeholder={PLACEHOLDER} />
    </div>
  );
}
