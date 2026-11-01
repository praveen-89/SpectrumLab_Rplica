"use server";

import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { grantSchema } from "@/lib/content/schemas";

const TABLE = "grants";
const PATHS = ["/funding/"];

export async function createGrant(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate(TABLE, "id", grantSchema, String(formData.get("json")), () => ({}), PATHS);
}

export async function updateGrant(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(TABLE, "id", id, grantSchema, String(formData.get("json")), () => ({}), PATHS);
}

export async function deleteGrant(id: string) {
  return genericDelete(TABLE, "id", id, PATHS);
}
