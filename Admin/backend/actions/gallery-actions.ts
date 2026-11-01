"use server";

import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { galleryEventSchema, galleryVideoSchema } from "@/lib/content/schemas";

const PHOTOS_PATHS = ["/gallery/photos/"];
const VIDEOS_PATHS = ["/gallery/videos/"];

export async function createGalleryEvent(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate("gallery_events", "id", galleryEventSchema, String(formData.get("json")), () => ({}), PHOTOS_PATHS);
}

export async function updateGalleryEvent(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate("gallery_events", "id", id, galleryEventSchema, String(formData.get("json")), () => ({}), PHOTOS_PATHS);
}

export async function deleteGalleryEvent(id: string) {
  return genericDelete("gallery_events", "id", id, PHOTOS_PATHS);
}

export async function createGalleryVideo(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate(
    "gallery_videos",
    "id",
    galleryVideoSchema,
    String(formData.get("json")),
    (data) => ({ youtube_id: data.youtubeId }),
    VIDEOS_PATHS,
  );
}

export async function updateGalleryVideo(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(
    "gallery_videos",
    "id",
    id,
    galleryVideoSchema,
    String(formData.get("json")),
    (data) => ({ youtube_id: data.youtubeId }),
    VIDEOS_PATHS,
  );
}

export async function deleteGalleryVideo(id: string) {
  return genericDelete("gallery_videos", "id", id, VIDEOS_PATHS);
}
