"use server";

import { z } from "zod";
import { genericUpdateSingleton, type JsonFormState } from "./generic-crud";
import { peopleGroupMetaSchema } from "@/lib/content/schemas";

// Mirrors lib/nav-types.ts's NavEntry shape for admin-side validation —
// kept separate since that file is deliberately free of any validation
// library import (it's bundled into the client-side Navbar component).
const navLinkSchema = z.object({ label: z.string(), href: z.string() });
const navDividerSchema = z.object({ divider: z.literal(true) });
const navDropdownItemSchema = z.union([navLinkSchema, navDividerSchema]);
const navDropdownSchema = z.object({ label: z.string(), items: z.array(navDropdownItemSchema) });
const navEntrySchema = z.union([navLinkSchema, navDropdownSchema]);
const navSchema = z.array(navEntrySchema);

const siteSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  social: z.object({
    email: z.string(),
    googleScholarUrl: z.string(),
    githubUrl: z.string(),
    twitterUrl: z.string(),
    twitterHandle: z.string(),
  }),
});

const peopleGroupsSchema = z.array(peopleGroupMetaSchema);

export async function updateNavConfig(_prevState: JsonFormState | undefined, formData: FormData) {
  // Navbar/search are global — invalidate the whole app's layout-level cache.
  return genericUpdateSingleton("site_config", "key", "nav", navSchema, String(formData.get("json")), [["/", "layout"]]);
}

export async function updateSiteConfig(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdateSingleton("site_config", "key", "site", siteSchema, String(formData.get("json")), [["/", "layout"]]);
}

export async function updatePeopleGroupsConfig(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdateSingleton("site_config", "key", "people-groups", peopleGroupsSchema, String(formData.get("json")), [
    ["/people/[group]", "page"],
  ]);
}
