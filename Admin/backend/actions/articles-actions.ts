"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { articleSchema } from "@/lib/content/schemas";

const TABLE = "articles";
const PATHS = ["/articles/"];
const schema = articleSchema.extend({ slug: z.string() });

export async function createArticle(_prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericCreate(
    TABLE,
    "id",
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date ?? null }),
    PATHS,
  );
  if (!result?.error) updateTag("articles");
  return result;
}

export async function updateArticle(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericUpdate(
    TABLE,
    "id",
    id,
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, item_date: data.date ?? null }),
    PATHS,
  );
  if (!result?.error) updateTag("articles");
  return result;
}

export async function deleteArticle(id: string) {
  const result = await genericDelete(TABLE, "id", id, PATHS);
  updateTag("articles");
  return result;
}
