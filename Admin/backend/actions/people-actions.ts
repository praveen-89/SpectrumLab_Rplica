"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { personSchema } from "@/lib/content/schemas";

// personSchema already has `group`; slug (readCollection-derived) is
// added here the same way it's added for news/talks/etc. `status` and
// `year` are NOT part of a person's own data — they're the admin-portal
// equivalent of which folder (current/ vs alumni/<year>/) the file used
// to live in, so they're separate form fields rather than JSON keys.
const schema = personSchema.extend({ slug: z.string() });

function peoplePaths(group: string, status: string, year: string | null, slug: string): Array<string | [string, "page"]> {
  const detailPath = status === "alumni" ? `/people/alumni/${group}/${year}/${slug}/` : `/people/current/${group}/${slug}/`;
  return [detailPath, ["/people/[group]", "page"], "/"];
}

export async function createPerson(_prevState: JsonFormState | undefined, formData: FormData) {
  const status = String(formData.get("status"));
  const year = String(formData.get("year") || "") || null;
  const parsed = schema.safeParse(JSON.parse(String(formData.get("json") || "{}")));
  const paths = parsed.success ? peoplePaths(parsed.data.group, status, year, parsed.data.slug) : ["/"];
  return genericCreate(
    "people",
    "id",
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, group: data.group, status, year: year ? Number(year) : null }),
    paths,
  );
}

export async function updatePerson(id: string, _prevState: JsonFormState | undefined, formData: FormData) {
  const status = String(formData.get("status"));
  const year = String(formData.get("year") || "") || null;
  const parsed = schema.safeParse(JSON.parse(String(formData.get("json") || "{}")));
  const paths = parsed.success ? peoplePaths(parsed.data.group, status, year, parsed.data.slug) : ["/"];
  return genericUpdate(
    "people",
    "id",
    id,
    schema,
    String(formData.get("json")),
    (data) => ({ slug: data.slug, group: data.group, status, year: year ? Number(year) : null }),
    paths,
  );
}

export async function deletePerson(id: string, group: string, status: string, year: number | null, slug: string) {
  const paths = peoplePaths(group, status, year ? String(year) : null, slug);
  await genericDelete("people", "id", id, paths);
  revalidatePath("/people/[group]", "page");
}
