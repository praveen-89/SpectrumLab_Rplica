"use server";

import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { recognitionItemSchema } from "@/lib/content/schemas";

const TABLE = "recognition";
const PATHS = ["/recognition/"];

export async function createRecognition(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate(TABLE, "id", recognitionItemSchema, String(formData.get("json")), () => ({}), PATHS);
}

export async function updateRecognition(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(TABLE, "id", id, recognitionItemSchema, String(formData.get("json")), () => ({}), PATHS);
}

export async function deleteRecognition(id: string) {
  return genericDelete(TABLE, "id", id, PATHS);
}
