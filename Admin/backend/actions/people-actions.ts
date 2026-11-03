"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { personSchema } from "@/lib/content/schemas";

// personSchema already has `group`; slug (readCollection-derived) is
// added here the same way it's added for news/talks/etc.
const schema = personSchema.extend({ slug: z.string() });

function extractLeaf(slug: string): string {
  const trimmed = slug.trim().replace(/^\/+|\/+$/g, "");
  return trimmed.includes("/") ? trimmed.split("/").filter(Boolean).pop() || "" : trimmed;
}

function buildCompositeSlug(status: string, group: string, year: string | number | null, slug: string): string {
  const leaf = extractLeaf(slug);
  if (status === "alumni") {
    const yearStr = year ? String(year).trim() : "";
    return `alumni/${group}/${yearStr}/${leaf}`.replace(/\/+/g, "/");
  }
  return `current/${group}/${leaf}`;
}

function peoplePaths(compositeSlug: string): Array<string | [string, "page"]> {
  const clean = compositeSlug.replace(/^\/+|\/+$/g, "");
  return [`/people/${clean}/`, ["/people/[group]", "page"], "/"];
}

export async function createPerson(_prevState: JsonFormState | undefined, formData: FormData) {
  const status = String(formData.get("status") || "current");
  const year = String(formData.get("year") || "") || null;
  const rawJson = String(formData.get("json") || "{}");
  const parsed = schema.safeParse(JSON.parse(rawJson));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid person data" };
  }

  const rawLeaf = String(formData.get("leafSlug") || "") || extractLeaf(parsed.data.slug);
  const compositeSlug = buildCompositeSlug(status, parsed.data.group, year, rawLeaf);
  const leafSlug = extractLeaf(rawLeaf);

  const dataPayload = { ...parsed.data, slug: compositeSlug };
  const paths = peoplePaths(compositeSlug);

  return genericCreate(
    "people",
    "id",
    schema,
    JSON.stringify(dataPayload),
    () => ({
      slug: leafSlug,
      group: parsed.data.group,
      status,
      year: year ? Number(year) : null,
    }),
    paths,
  );
}

export async function updatePerson(
  id: string,
  prevSlugOrState: string | JsonFormState | undefined,
  stateOrFormData?: JsonFormState | FormData,
  maybeFormData?: FormData,
) {
  const prevSlug = typeof prevSlugOrState === "string" ? prevSlugOrState : undefined;
  const formData = maybeFormData instanceof FormData ? maybeFormData : stateOrFormData instanceof FormData ? stateOrFormData : undefined;
  if (!formData) return { error: "Form data is required." };

  const status = String(formData.get("status") || "current");
  const year = String(formData.get("year") || "") || null;
  const rawJson = String(formData.get("json") || "{}");
  const parsed = schema.safeParse(JSON.parse(rawJson));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid person data" };
  }

  const rawLeaf = String(formData.get("leafSlug") || "") || extractLeaf(parsed.data.slug);
  const compositeSlug = buildCompositeSlug(status, parsed.data.group, year, rawLeaf);
  const leafSlug = extractLeaf(rawLeaf);

  const dataPayload = { ...parsed.data, slug: compositeSlug };
  const paths = peoplePaths(compositeSlug);
  if (prevSlug && prevSlug !== compositeSlug) {
    paths.push(`/people/${prevSlug.replace(/^\/+|\/+$/g, "")}/`);
  }

  return genericUpdate(
    "people",
    "id",
    id,
    schema,
    JSON.stringify(dataPayload),
    () => ({
      slug: leafSlug,
      group: parsed.data.group,
      status,
      year: year ? Number(year) : null,
    }),
    paths,
  );
}

export async function deletePerson(id: string, group: string, status: string, year: number | null, slug: string) {
  const compositeSlug = slug.startsWith("current/") || slug.startsWith("alumni/")
    ? slug
    : buildCompositeSlug(status, group, year, slug);
  const paths = peoplePaths(compositeSlug);
  await genericDelete("people", "id", id, paths);
  revalidatePath("/people/[group]", "page");
}
