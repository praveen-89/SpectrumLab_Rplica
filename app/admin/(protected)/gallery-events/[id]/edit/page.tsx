import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GalleryEventForm from "@/Admin/frontend/components/GalleryEventForm";
import { updateGalleryEvent, deleteGalleryEvent } from "@/Admin/backend/actions/gallery-actions";

export const metadata: Metadata = { title: "Edit Photo Event" };

export default async function EditGalleryEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("gallery_events").select("data").eq("id", id).single();
  if (!row) notFound();

  const data = row.data as { title?: string; description?: string; photos: Array<{ src: string; caption?: string }> };

  return (
    <GalleryEventForm
      initial={{
        title: data.title ?? "",
        description: data.description ?? "",
        photos: data.photos.map((photo) => ({ src: photo.src, caption: photo.caption ?? "" })),
      }}
      updateAction={updateGalleryEvent.bind(null, id)}
      deleteAction={deleteGalleryEvent.bind(null, id)}
    />
  );
}
