"use server";

import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";

const TABLE = "coauthors";
const PATHS = ["/publications/", "/"];
const schema = z.object({ href: z.string() });

export async function createCoauthor(_prevState: JsonFormState | undefined, formData: FormData) {
  const nameKey = String(formData.get("name_key"));
  return genericCreate(TABLE, "id", schema, String(formData.get("json")), () => ({ name_key: nameKey }), PATHS);
}

export async function updateCoauthor(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  const nameKey = String(formData.get("name_key"));
  return genericUpdate(TABLE, "id", id, schema, String(formData.get("json")), () => ({ name_key: nameKey }), PATHS);
}

export async function deleteCoauthor(id: string) {
  return genericDelete(TABLE, "id", id, PATHS);
}
