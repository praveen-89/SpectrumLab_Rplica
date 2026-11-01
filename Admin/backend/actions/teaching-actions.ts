"use server";

import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { courseSchema } from "@/lib/content/schemas";

const TABLE = "teaching";
const PATHS = ["/teaching/"];
const schema = courseSchema.extend({ slug: z.string() });

export async function createCourse(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericCreate(TABLE, "id", schema, String(formData.get("json")), (data) => ({ slug: data.slug }), PATHS);
}

export async function updateCourse(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(TABLE, "id", id, schema, String(formData.get("json")), (data) => ({ slug: data.slug }), PATHS);
}

export async function deleteCourse(id: string) {
  return genericDelete(TABLE, "id", id, PATHS);
}
