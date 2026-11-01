import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GalleryEventsList, { type GalleryEventRow } from "@/Admin/frontend/components/GalleryEventsList";

export const metadata: Metadata = { title: "Gallery Photos" };

export default async function AdminGalleryEventsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows, error } = await supabase.from("gallery_events").select("id, data").order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  const events: GalleryEventRow[] = rows.map((row) => {
    const data = row.data as { title?: string; photos: Array<{ src: string }> };
    return { id: row.id, title: data.title ?? "(untitled event)", photoCount: data.photos.length, thumbnail: data.photos[0]?.src };
  });

  return <GalleryEventsList events={events} />;
}
