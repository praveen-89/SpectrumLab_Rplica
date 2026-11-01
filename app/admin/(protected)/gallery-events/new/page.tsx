import type { Metadata } from "next";
import GalleryEventForm from "@/Admin/frontend/components/GalleryEventForm";
import { createGalleryEvent } from "@/Admin/backend/actions/gallery-actions";

export const metadata: Metadata = { title: "Add Photo Event" };

export default function NewGalleryEventPage() {
  return <GalleryEventForm createAction={createGalleryEvent} />;
}
