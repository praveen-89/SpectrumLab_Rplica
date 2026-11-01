import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GalleryVideosList, { type GalleryVideoRow } from "@/Admin/frontend/components/GalleryVideosList";

export const metadata: Metadata = { title: "Gallery Videos" };

export default async function AdminGalleryVideosPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("gallery_videos").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const videos: GalleryVideoRow[] = rows.map((row) => {
    const data = row.data as { youtubeId: string; title: string };
    return { id: row.id, youtubeId: data.youtubeId, title: data.title };
  });

  return <GalleryVideosList videos={videos} />;
}
