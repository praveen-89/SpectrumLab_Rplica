"use server";

import { revalidatePath, updateTag } from "next/cache";
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

function friendlyError(result: JsonFormState): JsonFormState {
  if (
    result?.error?.includes("23505") ||
    result?.error?.includes("duplicate key")
  ) {
    return {
      error:
        "A person with this slug already exists in this group. Please use a different slug and try again.",
    };
  }
  return result;
}

function peoplePaths(group: string, compositeSlug: string): Array<string | [string, "layout" | "page"]> {
  const clean = compositeSlug.replace(/^\/+|\/+$/g, "");
  return [
    `/people/${clean}/`,
    `/people/${clean}`,
    `/people/${group}/`,
    `/people/${group}`,
    ["/people/[group]", "page"],
    "/people/",
    "/people",
    "/",
    ["/", "layout"],
  ];
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
  const paths = peoplePaths(parsed.data.group, compositeSlug);

  const result = await genericCreate(
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
  if (!result?.error) updateTag("people");
  return friendlyError(result);
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
  const paths = peoplePaths(parsed.data.group, compositeSlug);
  if (prevSlug && prevSlug !== compositeSlug) {
    const cleanPrev = prevSlug.replace(/^\/+|\/+$/g, "");
    paths.push(`/people/${cleanPrev}/`);
    paths.push(`/people/${cleanPrev}`);
  }

  const result = await genericUpdate(
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
  if (!result?.error) updateTag("people");
  return friendlyError(result);
}

export async function deletePerson(id: string, group: string, status: string, year: number | null, slug: string) {
  const compositeSlug = slug.startsWith("current/") || slug.startsWith("alumni/")
    ? slug
    : buildCompositeSlug(status, group, year, slug);
  const paths = peoplePaths(group, compositeSlug);
  await genericDelete("people", "id", id, paths);
  revalidatePath("/people/[group]", "page");
  revalidatePath(`/people/${group}/`);
  revalidatePath(`/people/${group}`);
  revalidatePath("/", "layout");
  updateTag("people");
}
