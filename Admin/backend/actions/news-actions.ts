"use server";

import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { newsItemSchema } from "@/lib/content/schemas";

const TABLE = "news";
const PATHS = ["/news/", "/"];
// newsItemSchema has no slug field (readCollection derives it from the
// file path) — the admin instead edits it directly as part of the JSON,
// same as it already appears in the stored data (see migrate-to-supabase.mts).
const schema = newsItemSchema.extend({ slug: z.string() });

export async function createNews(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate(
    TABLE,
    "id",
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date }),
    PATHS,
  );
}

export async function updateNews(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(
    TABLE,
    "id",
    id,
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date }),
    PATHS,
  );
}

export async function deleteNews(id: string) {
  return genericDelete(TABLE, "id", id, PATHS);
}
