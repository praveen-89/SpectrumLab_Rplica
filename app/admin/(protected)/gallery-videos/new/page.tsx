import type { Metadata } from "next";
import GalleryVideoForm from "@/Admin/frontend/components/GalleryVideoForm";
import { createGalleryVideo } from "@/Admin/backend/actions/gallery-actions";

export const metadata: Metadata = { title: "Add Video" };

export default function NewGalleryVideoPage() {
  return <GalleryVideoForm createAction={createGalleryVideo} />;
}
