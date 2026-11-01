import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import JsonRow from "@/Admin/frontend/components/JsonRow";
import JsonCreateForm from "@/Admin/frontend/components/JsonCreateForm";
import { createGalleryVideo, updateGalleryVideo, deleteGalleryVideo } from "@/Admin/backend/actions/gallery-actions";

export const metadata: Metadata = { title: "Gallery Videos" };

const PLACEHOLDER = JSON.stringify({ youtubeId: "dQw4w9WgXcQ", title: "Video title", date: "2024-01-01", caption: "" }, null, 2);

export default async function AdminGalleryVideosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("gallery_videos").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  return (
    <div>
      <h1>Gallery Videos</h1>
      <p>Shown on the Gallery &gt; Videos page.</p>

      {rows.map((row) => (
        <JsonRow
          key={row.id}
          label={(row.data as { title: string }).title}
          initialJson={JSON.stringify(row.data, null, 2)}
          updateAction={updateGalleryVideo.bind(null, row.id)}
          deleteAction={deleteGalleryVideo.bind(null, row.id)}
        />
      ))}

      <h2>Add a video</h2>
      <JsonCreateForm createAction={createGalleryVideo} placeholder={PLACEHOLDER} />
    </div>
  );
}
