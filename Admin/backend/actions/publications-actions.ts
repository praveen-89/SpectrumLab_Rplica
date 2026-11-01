"use server";

import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { publicationSchema } from "@/lib/content/schemas";

const PATHS = ["/publications/", "/"];

export async function createPublication(_prevState: JsonFormState | undefined, formData: FormData) {
  // New entries sort after everything already migrated from papers.bib
  // within their year — exact tie order among admin-added entries isn't
  // meaningful the way the original file's order was.
  return genericCreate(
    "publications",
    "key",
    publicationSchema,
    String(formData.get("json")),
    (data) => ({ key: data.key, year: data.year, bib_order: 999999 }),
    PATHS,
  );
}

export async function updatePublication(key: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(
    "publications",
    "key",
    key,
    publicationSchema,
    String(formData.get("json")),
    (data) => ({ year: data.year }),
    PATHS,
  );
}

export async function deletePublication(key: string) {
  return genericDelete("publications", "key", key, PATHS);
}
