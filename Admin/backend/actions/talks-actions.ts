"use server";

import { z } from "zod";
import { genericCreate, genericUpdate, genericDelete, type JsonFormState } from "./generic-crud";
import { talkItemSchema } from "@/lib/content/schemas";

const PATHS_ORGANIZED = ["/talks/organized/"];
const PATHS_DELIVERED = ["/talks/delivered/"];
// slug follows the existing "year/leaf-slug" convention (e.g.
// "2009/2009-09-14-coherent-imaging-tissue"), typed directly as part of
// the JSON, same as it's already stored.
const schema = talkItemSchema.extend({ slug: z.string() });

function splitSlug(slug: string) {
  const [year, leaf] = slug.split("/");
  return { year: Number(year), slug: leaf };
}

export async function createTalk(_prevState: JsonFormState | undefined, formData: FormData) {
  const kind = String(formData.get("kind")) as "organized" | "delivered";
  return genericCreate(
    "talks",
    "id",
    schema,
    String(formData.get("json")),
    (data) => ({ kind, ...splitSlug(data.slug) }),
    kind === "organized" ? PATHS_ORGANIZED : PATHS_DELIVERED,
  );
}

export async function updateTalk(id: string, kind: "organized" | "delivered", _prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdate(
    "talks",
    "id",
    id,
    schema,
    String(formData.get("json")),
    (data) => ({ kind, ...splitSlug(data.slug) }),
    kind === "organized" ? PATHS_ORGANIZED : PATHS_DELIVERED,
  );
}

export async function deleteTalk(id: string, kind: "organized" | "delivered") {
  return genericDelete("talks", "id", id, kind === "organized" ? PATHS_ORGANIZED : PATHS_DELIVERED);
}
