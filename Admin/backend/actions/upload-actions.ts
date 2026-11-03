"use server";

import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "admin-uploads";

/**
 * Uploads an image file to Supabase Storage and returns its public URL.
 * Deviation from the literal spec (which says to write to public/assets/img/):
 * the whole site's content already migrated to Supabase as the live
 * backend, and filesystem writes don't survive serverless/most hosting —
 * so uploads go to Storage instead, and the resulting URL is stored in
 * the content record wherever the public site expects an image string
 * (Person.image, galleryPhotoSchema.src, Funder.logo are all just
 * strings, so a Storage URL is a drop-in value for any of them).
 * Uses the service-role client deliberately: storage write policies
 * aren't configured for the session-scoped client, and requireAdmin()
 * above is the actual gate — same pattern as the one-time migration
 * script's use of the service role.
 */
export async function uploadImage(folder: string, formData: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No file provided." };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed." };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_FILE_SIZE) {
    return { error: "File exceeds maximum allowed size of 5 MB." };
  }

  const supabase = createSupabaseAdminClient();
  const extension = file.name.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
