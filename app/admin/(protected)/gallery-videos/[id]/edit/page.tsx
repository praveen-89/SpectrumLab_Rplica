import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GalleryVideoForm from "@/Admin/frontend/components/GalleryVideoForm";
import { updateGalleryVideo, deleteGalleryVideo } from "@/Admin/backend/actions/gallery-actions";

export const metadata: Metadata = { title: "Edit Video" };

export default async function EditGalleryVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("gallery_videos").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { youtubeId: string; title: string; date?: string; caption?: string };

  return (
    <GalleryVideoForm
      initial={{ youtubeId: data.youtubeId, title: data.title, date: data.date ?? "", caption: data.caption ?? "" }}
      updateAction={updateGalleryVideo.bind(null, id)}
      deleteAction={deleteGalleryVideo.bind(null, id)}
    />
  );
}
