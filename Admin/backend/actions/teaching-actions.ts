"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { courseSchema } from "@/lib/content/schemas";

const TABLE = "teaching";
const PATHS = ["/teaching/"];
const schema = courseSchema.extend({ slug: z.string() });

export async function createCourse(_prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericCreate(TABLE, "id", schema, String(formData.get("json")), (data) => ({ slug: data.slug }), PATHS);
  if (!result?.error) updateTag("teaching");
  return result;
}

export async function updateCourse(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  const result = await genericUpdate(TABLE, "id", id, schema, String(formData.get("json")), (data) => ({ slug: data.slug }), PATHS);
  if (!result?.error) updateTag("teaching");
  return result;
}

export async function deleteCourse(id: string) {
  const result = await genericDelete(TABLE, "id", id, PATHS);
  updateTag("teaching");
  return result;
}
