"use server";

import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { articleSchema } from "@/lib/content/schemas";

const TABLE = "articles";
const PATHS = ["/articles/"];
const schema = articleSchema.extend({ slug: z.string() });

export async function createArticle(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate(
    TABLE,
    "id",
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date ?? null }),
    PATHS,
  );
}

export async function updateArticle(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(
    TABLE,
    "id",
    id,
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date ?? null }),
    PATHS,
  );
}

export async function deleteArticle(id: string) {
  return genericDelete(TABLE, "id", id, PATHS);
}
