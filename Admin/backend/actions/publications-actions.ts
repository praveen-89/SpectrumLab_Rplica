"use server";

import { updateTag } from "next/cache";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { publicationSchema } from "@/lib/content/schemas";

const PATHS = ["/publications/", "/"];

export async function createPublication(_prevState: JsonFormState | undefined, formData: FormData) {
  // New entries sort after everything already migrated from papers.bib
  // within their year — exact tie order among admin-added entries isn't
  // meaningful the way the original file's order was.
  const result = await genericCreate(
    "publications",
    "key",
    publicationSchema,
    String(formData.get("json")),
    (data) => ({ key: data.key, year: data.year, bib_order: 999999 }),
    PATHS,
  );
  if (!result?.error) updateTag("publications");
  return result;
}

export async function updatePublication(key: string, _prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericUpdate(
    "publications",
    "key",
    key,
    publicationSchema,
    String(formData.get("json")),
    (data) => ({ year: data.year }),
    PATHS,
  );
  if (!result?.error) updateTag("publications");
  return result;
}

export async function deletePublication(key: string) {
  const result = await genericDelete("publications", "key", key, PATHS);
  updateTag("publications");
  return result;
}
