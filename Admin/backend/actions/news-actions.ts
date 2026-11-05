"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { newsItemSchema } from "@/lib/content/schemas";

const TABLE = "news";
const PATHS = ["/news/", "/"];
// newsItemSchema has no slug field (readCollection derives it from the
// file path) — the admin instead edits it directly as part of the JSON,
// same as it already appears in the stored data (see migrate-to-supabase.mts).
const schema = newsItemSchema.extend({ slug: z.string() });

export async function createNews(_prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericCreate(
    TABLE,
    "id",
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date }),
    PATHS,
  );
  if (!result?.error) updateTag("news");
  return result;
}

export async function updateNews(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericUpdate(
    TABLE,
    "id",
    id,
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date }),
    PATHS,
  );
  if (!result?.error) updateTag("news");
  return result;
}

export async function deleteNews(id: string) {
  const result = await genericDelete(TABLE, "id", id, PATHS);
  updateTag("news");
  return result;
}
